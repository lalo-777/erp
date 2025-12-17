import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { PurchaseOrder } from '../models/mysql/PurchaseOrder';
import { PurchaseOrderItem } from '../models/mysql/PurchaseOrderItem';

/**
 * Get all purchase orders with pagination and filters
 */
export const getAllPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const statusId = req.query.status_id as string;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    let whereClause = 'WHERE po.is_active = TRUE';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND (po.po_number LIKE :search OR s.supplier_name LIKE :search)';
      replacements.search = `%${search}%`;
    }

    if (statusId) {
      whereClause += ' AND po.po_status_id = :statusId';
      replacements.statusId = statusId;
    }

    if (startDate) {
      whereClause += ' AND po.order_date >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      whereClause += ' AND po.order_date <= :endDate';
      replacements.endDate = endDate;
    }

    const query = `
      SELECT
        po.*,
        s.supplier_name,
        s.contact_name as supplier_contact,
        s.phone as supplier_phone,
        s.email as supplier_email,
        pos.name as status_name,
        pos.alias as status_alias,
        u.username as created_by_name,
        (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as items_count
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN cat_purchase_order_statuses pos ON po.po_status_id = pos.id
      LEFT JOIN users u ON po.created_by = u.id
      ${whereClause}
      ORDER BY po.order_date DESC, po.po_number DESC
      LIMIT :limit OFFSET :offset
    `;

    const orders = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ${whereClause}
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: {
        search: replacements.search,
        statusId: replacements.statusId,
        startDate: replacements.startDate,
        endDate: replacements.endDate,
      },
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get purchase order by ID with items
 */
export const getPurchaseOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        po.*,
        s.supplier_name,
        s.contact_name as supplier_contact,
        s.phone as supplier_phone,
        s.email as supplier_email,
        pos.name as status_name,
        pos.alias as status_alias,
        uc.username as created_by_name,
        um.username as modified_by_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN cat_purchase_order_statuses pos ON po.po_status_id = pos.id
      LEFT JOIN users uc ON po.created_by = uc.id
      LEFT JOIN users um ON po.modified_by = um.id
      WHERE po.id = :id AND po.is_active = TRUE
    `;

    const orders = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (orders.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
      return;
    }

    // Get items for this purchase order
    const itemsQuery = `
      SELECT
        poi.*,
        m.material_code,
        m.material_name,
        uom.name as unit_of_measure,
        mc.name as category_name
      FROM purchase_order_items poi
      LEFT JOIN materials m ON poi.material_id = m.id
      LEFT JOIN cat_units_of_measure uom ON m.unit_of_measure_id = uom.id
      LEFT JOIN cat_material_categories mc ON m.category_id = mc.id
      WHERE poi.purchase_order_id = :id
      ORDER BY poi.id ASC
    `;

    const items = await sequelize.query(itemsQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: {
        ...orders[0],
        items,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Generate next purchase order number
 */
export const getNextPONumber = async (): Promise<string> => {
  const query = `
    SELECT po_number
    FROM purchase_orders
    ORDER BY id DESC
    LIMIT 1
  `;

  const result = await sequelize.query(query, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (result.length === 0) {
    return 'PO-000001';
  }

  const lastNumber = result[0].po_number;
  const numericPart = parseInt(lastNumber.split('-')[1]);
  const nextNumber = numericPart + 1;
  return `PO-${nextNumber.toString().padStart(6, '0')}`;
};

/**
 * Create new purchase order with items
 */
export const createPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).user.id;
    const {
      supplier_id,
      project_id,
      order_date,
      expected_delivery_date,
      notes,
      items,
    } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one item is required',
      });
      return;
    }

    // Generate purchase order number
    const po_number = await getNextPONumber();

    // Calculate totals from items
    let subtotal = 0;
    for (const item of items) {
      subtotal += parseFloat(item.quantity) * parseFloat(item.unit_price);
    }

    const tax_amount = subtotal * 0.16; // 16% IVA
    const total_amount = subtotal + tax_amount;

    // Create purchase order
    const purchaseOrder = await PurchaseOrder.create({
      po_number,
      supplier_id,
      project_id,
      po_status_id: 1, // Draft
      order_date,
      expected_delivery_date,
      subtotal,
      tax_amount,
      total_amount,
      notes,
      created_by: userId,
      modified_by: userId,
    }, { transaction });

    // Create purchase order items
    const itemPromises = items.map((item: any) => {
      const itemAmount = parseFloat(item.quantity) * parseFloat(item.unit_price);
      return PurchaseOrderItem.create({
        purchase_order_id: purchaseOrder.id,
        material_id: item.material_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: itemAmount,
        received_quantity: 0,
      }, { transaction });
    });

    await Promise.all(itemPromises);

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: {
        id: purchaseOrder.id,
        po_number,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update purchase order
 */
export const updatePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const {
      supplier_id,
      project_id,
      order_date,
      expected_delivery_date,
      notes,
      items,
    } = req.body;

    const purchaseOrder = await PurchaseOrder.findByPk(id);

    if (!purchaseOrder) {
      res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
      return;
    }

    // Check if order can be edited
    if ((purchaseOrder.po_status_id as number) > 2) {
      res.status(400).json({
        success: false,
        message: 'Cannot edit purchase order in current status',
      });
      return;
    }

    // Calculate new totals if items provided
    let subtotal = purchaseOrder.subtotal;
    let tax_amount = purchaseOrder.tax_amount;
    let total_amount = purchaseOrder.total_amount;

    if (items && Array.isArray(items) && items.length > 0) {
      subtotal = 0;
      for (const item of items) {
        subtotal += parseFloat(item.quantity) * parseFloat(item.unit_price);
      }
      tax_amount = subtotal * 0.16;
      total_amount = subtotal + tax_amount;

      // Delete existing items and create new ones
      await sequelize.query(
        'DELETE FROM purchase_order_items WHERE purchase_order_id = :id',
        {
          replacements: { id },
          transaction,
        }
      );

      const itemPromises = items.map((item: any) => {
        const itemAmount = parseFloat(item.quantity) * parseFloat(item.unit_price);
        return PurchaseOrderItem.create({
          purchase_order_id: purchaseOrder.id,
          material_id: item.material_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: itemAmount,
          received_quantity: 0,
        }, { transaction });
      });

      await Promise.all(itemPromises);
    }

    // Update purchase order
    await purchaseOrder.update({
      supplier_id,
      project_id,
      order_date,
      expected_delivery_date,
      subtotal,
      tax_amount,
      total_amount,
      notes,
      modified_by: userId,
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to update purchase order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete purchase order (soft delete)
 */
export const deletePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const purchaseOrder = await PurchaseOrder.findByPk(id);

    if (!purchaseOrder) {
      res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
      return;
    }

    await purchaseOrder.update({
      is_active: false,
      modified_by: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Purchase order deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete purchase order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update purchase order status (approval workflow)
 */
export const updatePurchaseOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { status_id } = req.body;

    const purchaseOrder = await PurchaseOrder.findByPk(id);

    if (!purchaseOrder) {
      res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
      return;
    }

    await purchaseOrder.update({
      po_status_id: status_id,
      modified_by: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Purchase order status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update purchase order status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Receive materials from purchase order
 */
export const receiveMaterials = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { items } = req.body; // Array of { item_id, received_quantity }

    const purchaseOrder = await PurchaseOrder.findByPk(id);

    if (!purchaseOrder) {
      res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
      return;
    }

    // Check if order is approved
    if ((purchaseOrder.po_status_id as number) < 3) {
      res.status(400).json({
        success: false,
        message: 'Purchase order must be approved before receiving materials',
      });
      return;
    }

    // Update received quantities and material stock
    for (const item of items) {
      const poItem = await PurchaseOrderItem.findByPk(item.item_id);
      if (!poItem) continue;

      const newReceivedQty = parseFloat(poItem.received_quantity as any) + parseFloat(item.received_quantity);

      await poItem.update({
        received_quantity: newReceivedQty,
      }, { transaction });

      // Update material stock
      await sequelize.query(
        `UPDATE materials
         SET current_stock = current_stock + :quantity,
             modified_by = :userId,
             modified_date = NOW()
         WHERE id = :materialId`,
        {
          replacements: {
            quantity: item.received_quantity,
            userId,
            materialId: poItem.material_id,
          },
          transaction,
        }
      );
    }

    // Check if all items are fully received
    const allItemsQuery = `
      SELECT
        SUM(CASE WHEN received_quantity >= quantity THEN 1 ELSE 0 END) as fully_received,
        COUNT(*) as total_items,
        SUM(CASE WHEN received_quantity > 0 THEN 1 ELSE 0 END) as partially_received
      FROM purchase_order_items
      WHERE purchase_order_id = :id
    `;

    const [itemsStatus] = await sequelize.query(allItemsQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
    }) as any;

    let newStatusId = 4; // Partially Received
    if (itemsStatus.fully_received === itemsStatus.total_items) {
      newStatusId = 5; // Received
    }

    await purchaseOrder.update({
      po_status_id: newStatusId,
      modified_by: userId,
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Materials received successfully',
      data: {
        new_status_id: newStatusId,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to receive materials',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get purchase order statistics
 */
export const getPurchaseOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN po_status_id = 1 THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN po_status_id = 2 THEN 1 ELSE 0 END) as pending_approval,
        SUM(CASE WHEN po_status_id = 3 THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN po_status_id = 4 THEN 1 ELSE 0 END) as partially_received,
        SUM(CASE WHEN po_status_id = 5 THEN 1 ELSE 0 END) as received,
        SUM(CASE WHEN po_status_id = 6 THEN 1 ELSE 0 END) as cancelled,
        SUM(total_amount) as total_amount,
        SUM(CASE WHEN po_status_id IN (3, 4, 5) THEN total_amount ELSE 0 END) as approved_amount
      FROM purchase_orders
      WHERE is_active = TRUE
    `;

    const [stats] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    }) as any;

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase order statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all active suppliers
 */
export const getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        s.id,
        s.supplier_name,
        s.contact_name,
        s.phone,
        s.email,
        s.address,
        s.payment_terms,
        sc.name as category_name
      FROM suppliers s
      LEFT JOIN cat_supplier_categories sc ON s.supplier_category_id = sc.id
      WHERE s.is_active = TRUE
      ORDER BY s.supplier_name ASC
    `;

    const suppliers = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve suppliers',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
