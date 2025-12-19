import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { Supplier } from '../models/mysql/Supplier';

/**
 * Get all suppliers with pagination and search
 */
export const getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const categoryId = req.query.category_id as string;

    let whereClause = 'WHERE s.is_active = TRUE';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND (s.supplier_name LIKE :search OR s.contact_name LIKE :search OR s.email LIKE :search)';
      replacements.search = `%${search}%`;
    }

    if (categoryId) {
      whereClause += ' AND s.supplier_category_id = :categoryId';
      replacements.categoryId = parseInt(categoryId);
    }

    const query = `
      SELECT
        s.*,
        sc.name as category_name,
        u.username as created_by_name,
        (SELECT COUNT(*) FROM purchase_orders po WHERE po.supplier_id = s.id AND po.is_active = TRUE) as purchase_orders_count
      FROM suppliers s
      LEFT JOIN cat_supplier_categories sc ON s.supplier_category_id = sc.id
      LEFT JOIN users u ON s.created_by = u.id
      ${whereClause}
      ORDER BY s.supplier_name ASC
      LIMIT :limit OFFSET :offset
    `;

    const suppliers = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM suppliers s
      ${whereClause}
    `;

    const countReplacements: any = {};
    if (search) countReplacements.search = `%${search}%`;
    if (categoryId) countReplacements.categoryId = parseInt(categoryId);

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: countReplacements,
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: suppliers,
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
      message: 'Failed to retrieve suppliers',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get supplier by ID with details
 */
export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        s.*,
        sc.name as category_name,
        uc.username as created_by_name,
        um.username as modified_by_name,
        (SELECT COUNT(*) FROM purchase_orders po WHERE po.supplier_id = s.id AND po.is_active = TRUE) as purchase_orders_count,
        (SELECT COALESCE(SUM(po.total_amount), 0) FROM purchase_orders po WHERE po.supplier_id = s.id AND po.is_active = TRUE) as total_purchases
      FROM suppliers s
      LEFT JOIN cat_supplier_categories sc ON s.supplier_category_id = sc.id
      LEFT JOIN users uc ON s.created_by = uc.id
      LEFT JOIN users um ON s.modified_by = um.id
      WHERE s.id = :id AND s.is_active = TRUE
    `;

    const suppliers = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (suppliers.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: suppliers[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supplier',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get supplier statistics
 */
export const getSupplierStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_suppliers
      FROM suppliers
      WHERE is_active = TRUE
    `;

    const [stats] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    }) as any;

    // Get suppliers by category
    const categoryQuery = `
      SELECT
        sc.name as category_name,
        COUNT(*) as count
      FROM suppliers s
      LEFT JOIN cat_supplier_categories sc ON s.supplier_category_id = sc.id
      WHERE s.is_active = TRUE
      GROUP BY sc.id, sc.name
      ORDER BY count DESC
    `;

    const suppliersByCategory = await sequelize.query(categoryQuery, {
      type: QueryTypes.SELECT,
    });

    // Get top suppliers by purchase amount
    const topSuppliersQuery = `
      SELECT
        s.id,
        s.supplier_name,
        COUNT(po.id) as total_orders,
        COALESCE(SUM(po.total_amount), 0) as total_amount
      FROM suppliers s
      LEFT JOIN purchase_orders po ON s.id = po.supplier_id AND po.is_active = TRUE
      WHERE s.is_active = TRUE
      GROUP BY s.id, s.supplier_name
      ORDER BY total_amount DESC
      LIMIT 5
    `;

    const topSuppliers = await sequelize.query(topSuppliersQuery, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        suppliers_by_category: suppliersByCategory,
        top_suppliers: topSuppliers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supplier statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get supplier categories
 */
export const getSupplierCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT id, name, alias, description
      FROM cat_supplier_categories
      ORDER BY name ASC
    `;

    const categories = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supplier categories',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get purchase orders for a specific supplier
 */
export const getSupplierPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Verify supplier exists
    const supplierCheck = await sequelize.query(
      'SELECT id FROM suppliers WHERE id = :id AND is_active = TRUE',
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (supplierCheck.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
      return;
    }

    const query = `
      SELECT
        po.*,
        ps.name as status_name,
        ps.alias as status_alias,
        p.project_name,
        u.username as created_by_name,
        (SELECT COUNT(*) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) as items_count
      FROM purchase_orders po
      LEFT JOIN cat_purchase_order_statuses ps ON po.po_status_id = ps.id
      LEFT JOIN projects p ON po.project_id = p.id
      LEFT JOIN users u ON po.created_by = u.id
      WHERE po.supplier_id = :id AND po.is_active = TRUE
      ORDER BY po.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const orders = await sequelize.query(query, {
      replacements: { id, limit, offset },
      type: QueryTypes.SELECT,
    });

    const [{ total }] = await sequelize.query(
      'SELECT COUNT(*) as total FROM purchase_orders WHERE supplier_id = :id AND is_active = TRUE',
      { replacements: { id }, type: QueryTypes.SELECT }
    ) as any;

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
      message: 'Failed to retrieve supplier purchase orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create new supplier
 */
export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const supplierData = req.body;

    // Validate required fields
    if (!supplierData.supplier_name || !supplierData.supplier_category_id) {
      res.status(400).json({
        success: false,
        message: 'Supplier name and category are required',
      });
      return;
    }

    const supplier = await Supplier.create({
      ...supplierData,
      created_by: userId,
      modified_by: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update supplier
 */
export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const updateData = req.body;

    const [affectedRows] = await Supplier.update(
      {
        ...updateData,
        modified_by: userId,
      },
      {
        where: { id, is_active: true },
      }
    );

    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Soft delete supplier
 */
export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Check if supplier has active purchase orders
    const [{ count }] = await sequelize.query(
      'SELECT COUNT(*) as count FROM purchase_orders WHERE supplier_id = :id AND is_active = TRUE AND po_status_id NOT IN (5, 6)',
      { replacements: { id }, type: QueryTypes.SELECT }
    ) as any;

    if (count > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with active purchase orders',
      });
      return;
    }

    const [affectedRows] = await Supplier.update(
      {
        is_active: false,
        modified_by: userId,
      },
      {
        where: { id, is_active: true },
      }
    );

    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
