import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { PreInventory } from '../models/mysql/PreInventory';
import { InventoryTransaction } from '../models/mysql/InventoryTransaction';
import { Material } from '../models/mysql/Material';

/**
 * Create pre-inventory record
 */
export const createPreInventory = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const { material_id, warehouse_location_id, count_date, notes } = req.body;

    // Validate material exists
    const material = await Material.findByPk(material_id, { transaction });
    if (!material) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        message: 'Material not found',
      });
      return;
    }

    // Get expected quantity from location
    const [stockCheck] = await sequelize.query(
      `SELECT
        COALESCE(SUM(CASE
          WHEN tt.alias = 'entry' THEN it.quantity
          WHEN tt.alias = 'exit' THEN -it.quantity
          WHEN tt.alias = 'adjustment' THEN it.quantity
          ELSE 0
        END), 0) as expected_quantity
      FROM inventory_transactions it
      JOIN cat_transaction_types tt ON it.transaction_type_id = tt.id
      WHERE it.material_id = :material_id
        AND it.warehouse_location_id = :warehouse_location_id`,
      {
        replacements: { material_id, warehouse_location_id },
        type: QueryTypes.SELECT,
        transaction,
      }
    ) as any;

    // Generate pre-inventory number
    const [result] = await sequelize.query(
      "SELECT CONCAT('PINV-', LPAD(IFNULL(MAX(CAST(SUBSTRING(pre_inventory_number, 6) AS UNSIGNED)), 0) + 1, 6, '0')) as next_number FROM pre_inventory WHERE pre_inventory_number LIKE 'PINV-%'",
      { type: QueryTypes.SELECT, transaction }
    ) as any;

    const preInventoryNumber = result.next_number;

    // Create pre-inventory record
    const preInventory = await PreInventory.create({
      pre_inventory_number: preInventoryNumber,
      material_id,
      warehouse_location_id,
      expected_quantity: stockCheck.expected_quantity,
      unit_cost: material.unit_cost,
      count_date: count_date || new Date(),
      notes,
      status_id: 1, // Pending
      created_by: userId,
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Pre-inventory record created successfully',
      data: preInventory,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create pre-inventory record',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all pre-inventory records with filters
 */
export const getAllPreInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const materialId = req.query.materialId as string;
    const locationId = req.query.locationId as string;
    const statusId = req.query.statusId as string;
    const adjusted = req.query.adjusted as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let whereClause = 'WHERE 1=1';
    const replacements: any = { limit, offset };

    if (materialId) {
      whereClause += ' AND pi.material_id = :materialId';
      replacements.materialId = materialId;
    }

    if (locationId) {
      whereClause += ' AND pi.warehouse_location_id = :locationId';
      replacements.locationId = locationId;
    }

    if (statusId) {
      whereClause += ' AND pi.status_id = :statusId';
      replacements.statusId = statusId;
    }

    if (adjusted !== undefined) {
      whereClause += ' AND pi.adjusted = :adjusted';
      replacements.adjusted = adjusted === 'true' ? 1 : 0;
    }

    if (startDate) {
      whereClause += ' AND pi.count_date >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      whereClause += ' AND pi.count_date <= :endDate';
      replacements.endDate = endDate;
    }

    const query = `
      SELECT
        pi.id,
        pi.pre_inventory_number,
        pi.material_id,
        m.material_code,
        m.material_name,
        mc.name as category_name,
        uom.name as unit_name,
        pi.warehouse_location_id,
        wl.name as location_name,
        pi.expected_quantity,
        pi.counted_quantity,
        pi.discrepancy,
        pi.unit_cost,
        pi.discrepancy_value,
        pi.status_id,
        pis.status_name,
        pi.count_date,
        pi.counted_by,
        u_counted.username as counted_by_name,
        pi.adjusted,
        pi.adjustment_transaction_id,
        pi.notes,
        pi.created_by,
        u_created.username as created_by_name,
        pi.created_date
      FROM pre_inventory pi
      JOIN materials m ON pi.material_id = m.id
      LEFT JOIN cat_material_categories mc ON m.category_id = mc.id
      LEFT JOIN cat_unit_of_measure uom ON m.unit_of_measure_id = uom.id
      JOIN cat_warehouse_locations wl ON pi.warehouse_location_id = wl.id
      JOIN cat_pre_inventory_status pis ON pi.status_id = pis.id
      LEFT JOIN users u_counted ON pi.counted_by = u_counted.id
      LEFT JOIN users u_created ON pi.created_by = u_created.id
      ${whereClause}
      ORDER BY pi.count_date DESC, pi.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const records = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM pre_inventory pi
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
      data: records,
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
      message: 'Failed to retrieve pre-inventory records',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get pre-inventory record by ID
 */
export const getPreInventoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        pi.id,
        pi.pre_inventory_number,
        pi.material_id,
        m.material_code,
        m.material_name,
        mc.name as category_name,
        uom.name as unit_name,
        pi.warehouse_location_id,
        wl.name as location_name,
        pi.expected_quantity,
        pi.counted_quantity,
        pi.discrepancy,
        pi.unit_cost,
        pi.discrepancy_value,
        pi.status_id,
        pis.status_name,
        pi.count_date,
        pi.counted_by,
        u_counted.username as counted_by_name,
        pi.adjusted,
        pi.adjustment_transaction_id,
        it.transaction_number as adjustment_transaction_number,
        pi.notes,
        pi.created_by,
        u_created.username as created_by_name,
        pi.created_date,
        pi.updated_by,
        u_updated.username as updated_by_name,
        pi.updated_date
      FROM pre_inventory pi
      JOIN materials m ON pi.material_id = m.id
      LEFT JOIN cat_material_categories mc ON m.category_id = mc.id
      LEFT JOIN cat_unit_of_measure uom ON m.unit_of_measure_id = uom.id
      JOIN cat_warehouse_locations wl ON pi.warehouse_location_id = wl.id
      JOIN cat_pre_inventory_status pis ON pi.status_id = pis.id
      LEFT JOIN users u_counted ON pi.counted_by = u_counted.id
      LEFT JOIN users u_created ON pi.created_by = u_created.id
      LEFT JOIN users u_updated ON pi.updated_by = u_updated.id
      LEFT JOIN inventory_transactions it ON pi.adjustment_transaction_id = it.id
      WHERE pi.id = :id
    `;

    const [record] = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    }) as any;

    if (!record) {
      res.status(404).json({
        success: false,
        message: 'Pre-inventory record not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pre-inventory record',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update physical count
 */
export const updatePhysicalCount = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { counted_quantity, notes } = req.body;

    // Get pre-inventory record
    const preInventory = await PreInventory.findByPk(id, { transaction });
    if (!preInventory) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        message: 'Pre-inventory record not found',
      });
      return;
    }

    // Check if already adjusted
    if (preInventory.adjusted) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'Cannot update count - already adjusted',
      });
      return;
    }

    // Calculate discrepancy
    const discrepancy = counted_quantity - preInventory.expected_quantity;
    const discrepancy_value = discrepancy * preInventory.unit_cost;

    // Update pre-inventory record
    await PreInventory.update(
      {
        counted_quantity,
        discrepancy,
        discrepancy_value,
        counted_by: userId,
        status_id: 2, // Counted
        notes: notes || preInventory.notes,
        updated_by: userId,
      },
      {
        where: { id },
        transaction,
      }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Physical count updated successfully',
      data: {
        counted_quantity,
        discrepancy,
        discrepancy_value,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to update physical count',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Process adjustment (create inventory transaction for discrepancy)
 */
export const processAdjustment = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Get pre-inventory record
    const preInventory = await PreInventory.findByPk(id, { transaction });
    if (!preInventory) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        message: 'Pre-inventory record not found',
      });
      return;
    }

    // Validate status
    if (preInventory.status_id !== 2) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'Physical count must be completed before processing adjustment',
      });
      return;
    }

    // Check if already adjusted
    if (preInventory.adjusted) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'Adjustment already processed',
      });
      return;
    }

    // Check if there's a discrepancy
    if (!preInventory.discrepancy || preInventory.discrepancy === 0) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'No discrepancy to adjust',
      });
      return;
    }

    // Get adjustment transaction type
    const [adjustmentType] = await sequelize.query(
      "SELECT id FROM cat_transaction_types WHERE alias = 'adjustment'",
      { type: QueryTypes.SELECT, transaction }
    ) as any;

    // Generate transaction number
    const [result] = await sequelize.query(
      "SELECT CONCAT('TRX-', LPAD(IFNULL(MAX(CAST(SUBSTRING(transaction_number, 5) AS UNSIGNED)), 0) + 1, 6, '0')) as next_number FROM inventory_transactions WHERE transaction_number LIKE 'TRX-%'",
      { type: QueryTypes.SELECT, transaction }
    ) as any;

    const transactionNumber = result.next_number;

    // Create inventory transaction
    const inventoryTransaction = await InventoryTransaction.create({
      transaction_number: transactionNumber,
      material_id: preInventory.material_id,
      transaction_type_id: adjustmentType.id,
      warehouse_location_id: preInventory.warehouse_location_id,
      quantity: preInventory.discrepancy,
      unit_cost: preInventory.unit_cost,
      total_value: preInventory.discrepancy_value || 0,
      transaction_date: new Date(),
      notes: `Adjustment from pre-inventory ${preInventory.pre_inventory_number}`,
      created_by: userId,
    }, { transaction });

    // Update material current stock
    const material = await Material.findByPk(preInventory.material_id, { transaction });
    if (material) {
      const newStock = parseFloat(material.current_stock.toString()) + preInventory.discrepancy;
      await Material.update(
        {
          current_stock: newStock,
          modified_by: userId,
        },
        {
          where: { id: preInventory.material_id },
          transaction,
        }
      );
    }

    // Update pre-inventory record
    await PreInventory.update(
      {
        adjusted: true,
        adjustment_transaction_id: inventoryTransaction.id,
        status_id: 3, // Adjusted
        updated_by: userId,
      },
      {
        where: { id },
        transaction,
      }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Adjustment processed successfully',
      data: {
        transaction_number: transactionNumber,
        adjustment_quantity: preInventory.discrepancy,
        adjustment_value: preInventory.discrepancy_value,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to process adjustment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get discrepancy report
 */
export const getDiscrepancyReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const locationId = req.query.locationId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const onlyDiscrepancies = req.query.onlyDiscrepancies === 'true';

    let whereClause = 'WHERE pi.status_id >= 2'; // Only counted or adjusted
    const replacements: any = {};

    if (locationId) {
      whereClause += ' AND pi.warehouse_location_id = :locationId';
      replacements.locationId = locationId;
    }

    if (startDate) {
      whereClause += ' AND pi.count_date >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      whereClause += ' AND pi.count_date <= :endDate';
      replacements.endDate = endDate;
    }

    if (onlyDiscrepancies) {
      whereClause += ' AND pi.discrepancy != 0';
    }

    const query = `
      SELECT
        pi.id,
        pi.pre_inventory_number,
        pi.material_id,
        m.material_code,
        m.material_name,
        mc.name as category_name,
        wl.name as location_name,
        pi.expected_quantity,
        pi.counted_quantity,
        pi.discrepancy,
        pi.unit_cost,
        pi.discrepancy_value,
        pi.adjusted,
        pi.adjustment_transaction_id,
        pi.count_date,
        u_counted.username as counted_by_name
      FROM pre_inventory pi
      JOIN materials m ON pi.material_id = m.id
      LEFT JOIN cat_material_categories mc ON m.category_id = mc.id
      JOIN cat_warehouse_locations wl ON pi.warehouse_location_id = wl.id
      LEFT JOIN users u_counted ON pi.counted_by = u_counted.id
      ${whereClause}
      ORDER BY ABS(pi.discrepancy_value) DESC, pi.count_date DESC
    `;

    const report = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // Calculate summary
    const summaryQuery = `
      SELECT
        COUNT(*) as total_counts,
        SUM(CASE WHEN pi.discrepancy != 0 THEN 1 ELSE 0 END) as discrepancies_count,
        SUM(CASE WHEN pi.discrepancy > 0 THEN 1 ELSE 0 END) as overages,
        SUM(CASE WHEN pi.discrepancy < 0 THEN 1 ELSE 0 END) as shortages,
        SUM(CASE WHEN pi.adjusted THEN 1 ELSE 0 END) as adjustments_processed,
        SUM(pi.discrepancy_value) as total_discrepancy_value
      FROM pre_inventory pi
      ${whereClause}
    `;

    const [summary] = await sequelize.query(summaryQuery, {
      replacements,
      type: QueryTypes.SELECT,
    }) as any;

    res.status(200).json({
      success: true,
      data: {
        summary,
        details: report,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate discrepancy report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get pre-inventory statistics
 */
export const getPreInventoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_counts,
        COUNT(CASE WHEN status_id = 1 THEN 1 END) as pending_counts,
        COUNT(CASE WHEN status_id = 2 THEN 1 END) as completed_counts,
        COUNT(CASE WHEN status_id = 3 THEN 1 END) as adjusted_counts,
        COUNT(CASE WHEN discrepancy != 0 AND status_id >= 2 THEN 1 END) as with_discrepancies,
        COUNT(CASE WHEN discrepancy > 0 THEN 1 END) as overages,
        COUNT(CASE WHEN discrepancy < 0 THEN 1 END) as shortages,
        SUM(CASE WHEN discrepancy_value > 0 THEN discrepancy_value ELSE 0 END) as total_overage_value,
        SUM(CASE WHEN discrepancy_value < 0 THEN ABS(discrepancy_value) ELSE 0 END) as total_shortage_value,
        SUM(ABS(discrepancy_value)) as total_discrepancy_value
      FROM pre_inventory
    `;

    const [stats] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    }) as any;

    // Get recent counts
    const recentQuery = `
      SELECT
        pi.id,
        pi.pre_inventory_number,
        m.material_name,
        wl.name as location_name,
        pi.discrepancy,
        pi.discrepancy_value,
        pi.count_date
      FROM pre_inventory pi
      JOIN materials m ON pi.material_id = m.id
      JOIN cat_warehouse_locations wl ON pi.warehouse_location_id = wl.id
      WHERE pi.status_id >= 2
      ORDER BY pi.count_date DESC
      LIMIT 10
    `;

    const recentCounts = await sequelize.query(recentQuery, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        recent_counts: recentCounts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pre-inventory statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete pre-inventory record (only if not adjusted)
 */
export const deletePreInventory = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Get pre-inventory record
    const preInventory = await PreInventory.findByPk(id, { transaction });
    if (!preInventory) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        message: 'Pre-inventory record not found',
      });
      return;
    }

    // Check if adjusted
    if (preInventory.adjusted) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'Cannot delete adjusted pre-inventory record',
      });
      return;
    }

    // Update status to cancelled instead of deleting
    await PreInventory.update(
      {
        status_id: 4, // Cancelled
        updated_by: (req as any).userId,
      },
      {
        where: { id },
        transaction,
      }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Pre-inventory record cancelled successfully',
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to delete pre-inventory record',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
