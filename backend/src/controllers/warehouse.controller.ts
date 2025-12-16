import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { InventoryTransaction } from '../models/mysql/InventoryTransaction';
import { WarehouseReorganization } from '../models/mysql/WarehouseReorganization';
import { Material } from '../models/mysql/Material';

/**
 * Get all warehouse locations
 */
export const getAllWarehouseLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        wl.id,
        wl.name,
        wl.alias,
        wl.address,
        COUNT(DISTINCT it.material_id) as materials_count,
        SUM(CASE
          WHEN tt.alias = 'entry' THEN it.quantity
          WHEN tt.alias = 'exit' THEN -it.quantity
          ELSE 0
        END) as total_quantity
      FROM cat_warehouse_locations wl
      LEFT JOIN inventory_transactions it ON wl.id = it.warehouse_location_id
      LEFT JOIN cat_transaction_types tt ON it.transaction_type_id = tt.id
      GROUP BY wl.id, wl.name, wl.alias, wl.address
      ORDER BY wl.name ASC
    `;

    const locations = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve warehouse locations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get stock by warehouse location
 */
export const getStockByLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const search = req.query.search as string || '';

    let whereClause = 'WHERE m.is_active = TRUE';
    const replacements: any = { locationId };

    if (search) {
      whereClause += ' AND (m.material_name LIKE :search OR m.material_code LIKE :search)';
      replacements.search = `%${search}%`;
    }

    const query = `
      SELECT
        m.id,
        m.material_code,
        m.material_name,
        mc.name as category_name,
        uom.name as unit_name,
        uom.alias as unit_alias,
        COALESCE(SUM(CASE
          WHEN tt.alias = 'entry' THEN it.quantity
          WHEN tt.alias = 'exit' THEN -it.quantity
          WHEN tt.alias = 'adjustment' THEN it.quantity
          ELSE 0
        END), 0) as location_stock,
        m.current_stock as total_stock,
        m.minimum_stock,
        m.unit_cost
      FROM materials m
      LEFT JOIN cat_material_categories mc ON m.category_id = mc.id
      LEFT JOIN cat_unit_of_measure uom ON m.unit_of_measure_id = uom.id
      LEFT JOIN inventory_transactions it ON m.id = it.material_id AND it.warehouse_location_id = :locationId
      LEFT JOIN cat_transaction_types tt ON it.transaction_type_id = tt.id
      ${whereClause}
      GROUP BY m.id, m.material_code, m.material_name, mc.name, uom.name, uom.alias, m.current_stock, m.minimum_stock, m.unit_cost
      HAVING location_stock > 0
      ORDER BY m.material_name ASC
    `;

    const materials = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stock by location',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Transfer material between warehouse locations
 */
export const transferMaterial = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const { material_id, from_location_id, to_location_id, quantity, reason, transfer_date } = req.body;

    // Validate transfer
    if (from_location_id === to_location_id) {
      res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same location',
      });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero',
      });
      return;
    }

    // Check if material exists in source location with sufficient quantity
    const [stockCheck] = await sequelize.query(
      `SELECT
        COALESCE(SUM(CASE
          WHEN tt.alias = 'entry' THEN it.quantity
          WHEN tt.alias = 'exit' THEN -it.quantity
          WHEN tt.alias = 'adjustment' THEN it.quantity
          ELSE 0
        END), 0) as available_stock
      FROM inventory_transactions it
      JOIN cat_transaction_types tt ON it.transaction_type_id = tt.id
      WHERE it.material_id = :material_id
        AND it.warehouse_location_id = :from_location_id`,
      {
        replacements: { material_id, from_location_id },
        type: QueryTypes.SELECT,
        transaction,
      }
    ) as any;

    if (stockCheck.available_stock < quantity) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${stockCheck.available_stock}`,
      });
      return;
    }

    // Get material details for unit cost
    const material = await Material.findByPk(material_id, { transaction });
    if (!material) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        message: 'Material not found',
      });
      return;
    }

    // Generate transaction numbers
    const [exitResult] = await sequelize.query(
      "SELECT CONCAT('TRX-', LPAD(IFNULL(MAX(CAST(SUBSTRING(transaction_number, 5) AS UNSIGNED)), 0) + 1, 6, '0')) as next_number FROM inventory_transactions WHERE transaction_number LIKE 'TRX-%'",
      { type: QueryTypes.SELECT, transaction }
    ) as any;

    const exitNumber = exitResult.next_number;
    const entryNumber = `TRX-${String(parseInt(exitNumber.split('-')[1]) + 1).padStart(6, '0')}`;

    // Get transfer transaction type ID
    const [transferType] = await sequelize.query(
      "SELECT id FROM cat_transaction_types WHERE alias = 'transfer'",
      { type: QueryTypes.SELECT, transaction }
    ) as any;

    // Create exit transaction from source location
    await InventoryTransaction.create({
      transaction_number: exitNumber,
      material_id,
      transaction_type_id: transferType.id,
      warehouse_location_id: from_location_id,
      quantity: -quantity,
      unit_cost: material.unit_cost,
      total_value: -quantity * material.unit_cost,
      transaction_date: transfer_date || new Date(),
      notes: `Transfer to location ${to_location_id}${reason ? ': ' + reason : ''}`,
      created_by: userId,
    }, { transaction });

    // Create entry transaction to destination location
    await InventoryTransaction.create({
      transaction_number: entryNumber,
      material_id,
      transaction_type_id: transferType.id,
      warehouse_location_id: to_location_id,
      quantity,
      unit_cost: material.unit_cost,
      total_value: quantity * material.unit_cost,
      transaction_date: transfer_date || new Date(),
      notes: `Transfer from location ${from_location_id}${reason ? ': ' + reason : ''}`,
      created_by: userId,
    }, { transaction });

    // Record in warehouse_reorganization table
    await WarehouseReorganization.create({
      material_id,
      from_location_id,
      to_location_id,
      quantity,
      reorganization_date: transfer_date || new Date(),
      reason,
      performed_by: userId,
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Material transferred successfully',
      data: {
        exit_transaction: exitNumber,
        entry_transaction: entryNumber,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to transfer material',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Adjust inventory (entry or exit)
 */
export const adjustInventory = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const {
      material_id,
      warehouse_location_id,
      quantity,
      transaction_type, // 'entry' or 'exit' or 'adjustment'
      reference_number,
      notes,
      transaction_date
    } = req.body;

    if (quantity === 0) {
      res.status(400).json({
        success: false,
        message: 'Quantity cannot be zero',
      });
      return;
    }

    // Get material details
    const material = await Material.findByPk(material_id, { transaction });
    if (!material) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        message: 'Material not found',
      });
      return;
    }

    // Get transaction type ID
    const [transactionType] = await sequelize.query(
      "SELECT id FROM cat_transaction_types WHERE alias = :alias",
      {
        replacements: { alias: transaction_type },
        type: QueryTypes.SELECT,
        transaction
      }
    ) as any;

    if (!transactionType) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'Invalid transaction type',
      });
      return;
    }

    // Generate transaction number
    const [result] = await sequelize.query(
      "SELECT CONCAT('TRX-', LPAD(IFNULL(MAX(CAST(SUBSTRING(transaction_number, 5) AS UNSIGNED)), 0) + 1, 6, '0')) as next_number FROM inventory_transactions WHERE transaction_number LIKE 'TRX-%'",
      { type: QueryTypes.SELECT, transaction }
    ) as any;

    const transactionNumber = result.next_number;

    // Calculate actual quantity based on type
    let actualQuantity = quantity;
    if (transaction_type === 'exit') {
      actualQuantity = -Math.abs(quantity);
    }

    // Create inventory transaction
    await InventoryTransaction.create({
      transaction_number: transactionNumber,
      material_id,
      transaction_type_id: transactionType.id,
      warehouse_location_id,
      quantity: actualQuantity,
      unit_cost: material.unit_cost,
      total_value: actualQuantity * material.unit_cost,
      reference_number,
      notes,
      transaction_date: transaction_date || new Date(),
      created_by: userId,
    }, { transaction });

    // Update material current stock
    const newStock = parseFloat(material.current_stock.toString()) + actualQuantity;
    await Material.update(
      {
        current_stock: newStock,
        modified_by: userId
      },
      {
        where: { id: material_id },
        transaction
      }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: {
        transaction_number: transactionNumber,
        new_stock: newStock,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to adjust inventory',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get transaction history with filters
 */
export const getTransactionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const materialId = req.query.materialId as string;
    const locationId = req.query.locationId as string;
    const transactionType = req.query.transactionType as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let whereClause = 'WHERE 1=1';
    const replacements: any = { limit, offset };

    if (materialId) {
      whereClause += ' AND it.material_id = :materialId';
      replacements.materialId = materialId;
    }

    if (locationId) {
      whereClause += ' AND it.warehouse_location_id = :locationId';
      replacements.locationId = locationId;
    }

    if (transactionType) {
      whereClause += ' AND tt.alias = :transactionType';
      replacements.transactionType = transactionType;
    }

    if (startDate) {
      whereClause += ' AND it.transaction_date >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      whereClause += ' AND it.transaction_date <= :endDate';
      replacements.endDate = endDate;
    }

    const query = `
      SELECT
        it.id,
        it.transaction_number,
        it.material_id,
        m.material_code,
        m.material_name,
        it.transaction_type_id,
        tt.name as transaction_type,
        tt.alias as transaction_type_alias,
        it.warehouse_location_id,
        wl.name as location_name,
        it.quantity,
        it.unit_cost,
        it.total_value,
        it.reference_number,
        it.notes,
        it.transaction_date,
        it.created_by,
        u.username as created_by_name,
        it.created_date
      FROM inventory_transactions it
      JOIN materials m ON it.material_id = m.id
      JOIN cat_transaction_types tt ON it.transaction_type_id = tt.id
      JOIN cat_warehouse_locations wl ON it.warehouse_location_id = wl.id
      LEFT JOIN users u ON it.created_by = u.id
      ${whereClause}
      ORDER BY it.transaction_date DESC, it.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const transactions = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory_transactions it
      JOIN cat_transaction_types tt ON it.transaction_type_id = tt.id
      ${whereClause}
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: Object.keys(replacements).reduce((acc: any, key) => {
        if (key !== 'limit' && key !== 'offset') {
          acc[key] = replacements[key];
        }
        return acc;
      }, {}),
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: transactions,
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
      message: 'Failed to retrieve transaction history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get warehouse statistics
 */
export const getWarehouseStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        COUNT(DISTINCT wl.id) as total_locations,
        COUNT(DISTINCT it.material_id) as total_materials_in_stock,
        COUNT(it.id) as total_transactions,
        SUM(CASE WHEN tt.alias = 'entry' THEN 1 ELSE 0 END) as total_entries,
        SUM(CASE WHEN tt.alias = 'exit' THEN 1 ELSE 0 END) as total_exits,
        SUM(CASE WHEN tt.alias = 'transfer' THEN 1 ELSE 0 END) as total_transfers,
        SUM(CASE WHEN tt.alias = 'adjustment' THEN 1 ELSE 0 END) as total_adjustments,
        SUM(CASE WHEN tt.alias = 'entry' THEN it.total_value ELSE 0 END) as total_entries_value,
        SUM(CASE WHEN tt.alias = 'exit' THEN ABS(it.total_value) ELSE 0 END) as total_exits_value
      FROM cat_warehouse_locations wl
      LEFT JOIN inventory_transactions it ON wl.id = it.warehouse_location_id
      LEFT JOIN cat_transaction_types tt ON it.transaction_type_id = tt.id
    `;

    const [stats] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    }) as any;

    // Get stock value by location
    const locationQuery = `
      SELECT
        wl.id,
        wl.name as location_name,
        COUNT(DISTINCT it.material_id) as materials_count,
        SUM(CASE
          WHEN tt.alias = 'entry' THEN it.quantity
          WHEN tt.alias = 'exit' THEN -it.quantity
          WHEN tt.alias = 'adjustment' THEN it.quantity
          ELSE 0
        END) as total_quantity,
        SUM(CASE
          WHEN tt.alias = 'entry' THEN it.total_value
          WHEN tt.alias = 'exit' THEN -it.total_value
          WHEN tt.alias = 'adjustment' THEN it.total_value
          ELSE 0
        END) as stock_value
      FROM cat_warehouse_locations wl
      LEFT JOIN inventory_transactions it ON wl.id = it.warehouse_location_id
      LEFT JOIN cat_transaction_types tt ON it.transaction_type_id = tt.id
      GROUP BY wl.id, wl.name
      ORDER BY stock_value DESC
    `;

    const stockByLocation = await sequelize.query(locationQuery, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        stock_by_location: stockByLocation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve warehouse statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get stock report (all materials with stock by location)
 */
export const getStockReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const locationId = req.query.locationId as string;
    const categoryId = req.query.categoryId as string;
    const lowStock = req.query.lowStock === 'true';

    let whereClause = 'WHERE m.is_active = TRUE';
    const replacements: any = {};

    if (locationId) {
      whereClause += ' AND wl.id = :locationId';
      replacements.locationId = locationId;
    }

    if (categoryId) {
      whereClause += ' AND m.category_id = :categoryId';
      replacements.categoryId = categoryId;
    }

    const query = `
      SELECT
        m.id,
        m.material_code,
        m.material_name,
        mc.name as category_name,
        uom.name as unit_name,
        wl.id as location_id,
        wl.name as location_name,
        COALESCE(SUM(CASE
          WHEN tt.alias = 'entry' THEN it.quantity
          WHEN tt.alias = 'exit' THEN -it.quantity
          WHEN tt.alias = 'adjustment' THEN it.quantity
          ELSE 0
        END), 0) as location_stock,
        m.current_stock as total_stock,
        m.minimum_stock,
        m.reorder_point,
        m.unit_cost,
        COALESCE(SUM(CASE
          WHEN tt.alias = 'entry' THEN it.quantity
          WHEN tt.alias = 'exit' THEN -it.quantity
          WHEN tt.alias = 'adjustment' THEN it.quantity
          ELSE 0
        END), 0) * m.unit_cost as stock_value
      FROM materials m
      CROSS JOIN cat_warehouse_locations wl
      LEFT JOIN cat_material_categories mc ON m.category_id = mc.id
      LEFT JOIN cat_unit_of_measure uom ON m.unit_of_measure_id = uom.id
      LEFT JOIN inventory_transactions it ON m.id = it.material_id AND wl.id = it.warehouse_location_id
      LEFT JOIN cat_transaction_types tt ON it.transaction_type_id = tt.id
      ${whereClause}
      GROUP BY m.id, m.material_code, m.material_name, mc.name, uom.name, wl.id, wl.name, m.current_stock, m.minimum_stock, m.reorder_point, m.unit_cost
      ${lowStock ? 'HAVING location_stock < m.minimum_stock AND location_stock > 0' : 'HAVING location_stock > 0'}
      ORDER BY m.material_name ASC, wl.name ASC
    `;

    const report = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate stock report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get transfer history
 */
export const getTransferHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const materialId = req.query.materialId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let whereClause = 'WHERE 1=1';
    const replacements: any = { limit, offset };

    if (materialId) {
      whereClause += ' AND wr.material_id = :materialId';
      replacements.materialId = materialId;
    }

    if (startDate) {
      whereClause += ' AND wr.reorganization_date >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      whereClause += ' AND wr.reorganization_date <= :endDate';
      replacements.endDate = endDate;
    }

    const query = `
      SELECT
        wr.id,
        wr.material_id,
        m.material_code,
        m.material_name,
        wr.from_location_id,
        wl_from.name as from_location_name,
        wr.to_location_id,
        wl_to.name as to_location_name,
        wr.quantity,
        wr.reorganization_date,
        wr.reason,
        wr.performed_by,
        u.username as performed_by_name,
        wr.created_date
      FROM warehouse_reorganization wr
      JOIN materials m ON wr.material_id = m.id
      JOIN cat_warehouse_locations wl_from ON wr.from_location_id = wl_from.id
      JOIN cat_warehouse_locations wl_to ON wr.to_location_id = wl_to.id
      LEFT JOIN users u ON wr.performed_by = u.id
      ${whereClause}
      ORDER BY wr.reorganization_date DESC, wr.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const transfers = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM warehouse_reorganization wr
      ${whereClause}
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: Object.keys(replacements).reduce((acc: any, key) => {
        if (key !== 'limit' && key !== 'offset') {
          acc[key] = replacements[key];
        }
        return acc;
      }, {}),
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: transfers,
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
      message: 'Failed to retrieve transfer history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
