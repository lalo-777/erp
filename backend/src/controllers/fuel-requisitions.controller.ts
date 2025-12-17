import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { FuelRequisition } from '../models/mysql/FuelRequisition';

/**
 * Get all fuel requisitions with pagination and filters
 */
export const getAllRequisitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const projectId = req.query.project_id as string;
    const requisitionStatus = req.query.requisition_status as string;
    const fuelType = req.query.fuel_type as string;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    let whereClause = 'WHERE fr.is_active = TRUE';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND (fr.vehicle_equipment_name LIKE :search OR fr.requisition_code LIKE :search)';
      replacements.search = `%${search}%`;
    }

    if (projectId) {
      whereClause += ' AND fr.project_id = :projectId';
      replacements.projectId = projectId;
    }

    if (requisitionStatus) {
      whereClause += ' AND fr.requisition_status = :requisitionStatus';
      replacements.requisitionStatus = requisitionStatus;
    }

    if (fuelType) {
      whereClause += ' AND fr.fuel_type = :fuelType';
      replacements.fuelType = fuelType;
    }

    if (startDate) {
      whereClause += ' AND fr.requisition_date >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      whereClause += ' AND fr.requisition_date <= :endDate';
      replacements.endDate = endDate;
    }

    const query = `
      SELECT
        fr.*,
        p.project_name,
        p.project_number,
        u.username as created_by_name,
        ua.username as approved_by_name
      FROM fuel_requisitions fr
      LEFT JOIN projects p ON fr.project_id = p.id
      LEFT JOIN users u ON fr.created_by = u.id
      LEFT JOIN users ua ON fr.approved_by = ua.id
      ${whereClause}
      ORDER BY fr.requisition_date DESC, fr.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const requisitions = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM fuel_requisitions fr
      ${whereClause}
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: {
        search: replacements.search,
        projectId: replacements.projectId,
        requisitionStatus: replacements.requisitionStatus,
        fuelType: replacements.fuelType,
        startDate: replacements.startDate,
        endDate: replacements.endDate,
      },
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: requisitions,
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
      message: 'Failed to retrieve fuel requisitions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get fuel requisition by ID
 */
export const getRequisitionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        fr.*,
        p.project_name,
        p.project_number,
        uc.username as created_by_name,
        um.username as modified_by_name,
        ua.username as approved_by_name
      FROM fuel_requisitions fr
      LEFT JOIN projects p ON fr.project_id = p.id
      LEFT JOIN users uc ON fr.created_by = uc.id
      LEFT JOIN users um ON fr.modified_by = um.id
      LEFT JOIN users ua ON fr.approved_by = ua.id
      WHERE fr.id = :id AND fr.is_active = TRUE
    `;

    const requisitions = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (requisitions.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Fuel requisition not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: requisitions[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fuel requisition',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get fuel statistics
 */
export const getFuelStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_requisitions,
        COUNT(DISTINCT vehicle_equipment_name) as total_vehicles,
        SUM(quantity_liters) as total_liters,
        SUM(total_amount) as total_cost,
        AVG(quantity_liters) as avg_liters_per_requisition,
        AVG(unit_price) as avg_unit_price,
        SUM(CASE WHEN requisition_status = 'pending' THEN total_amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN requisition_status = 'approved' THEN total_amount ELSE 0 END) as approved_amount,
        SUM(CASE WHEN requisition_status = 'delivered' THEN total_amount ELSE 0 END) as delivered_amount,
        SUM(CASE WHEN fuel_type = 'gasoline' THEN quantity_liters ELSE 0 END) as gasoline_liters,
        SUM(CASE WHEN fuel_type = 'diesel' THEN quantity_liters ELSE 0 END) as diesel_liters,
        SUM(CASE WHEN fuel_type = 'other' THEN quantity_liters ELSE 0 END) as other_liters
      FROM fuel_requisitions
      WHERE is_active = TRUE
    `;

    const [stats] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    }) as any;

    // Get fuel consumption by vehicle/equipment
    const vehicleQuery = `
      SELECT
        vehicle_equipment_name,
        COUNT(*) as requisition_count,
        SUM(quantity_liters) as total_liters,
        SUM(total_amount) as total_cost,
        AVG(quantity_liters) as avg_liters,
        fuel_type
      FROM fuel_requisitions
      WHERE is_active = TRUE
      GROUP BY vehicle_equipment_name, fuel_type
      ORDER BY total_liters DESC
      LIMIT 10
    `;

    const topVehicles = await sequelize.query(vehicleQuery, {
      type: QueryTypes.SELECT,
    });

    // Get fuel consumption by project
    const projectQuery = `
      SELECT
        p.project_name,
        p.project_number,
        COUNT(*) as requisition_count,
        SUM(fr.quantity_liters) as total_liters,
        SUM(fr.total_amount) as fuel_cost
      FROM fuel_requisitions fr
      LEFT JOIN projects p ON fr.project_id = p.id
      WHERE fr.is_active = TRUE AND fr.project_id IS NOT NULL
      GROUP BY p.id, p.project_name, p.project_number
      ORDER BY fuel_cost DESC
      LIMIT 10
    `;

    const fuelByProject = await sequelize.query(projectQuery, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        top_vehicles: topVehicles,
        fuel_by_project: fuelByProject,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fuel statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get consumption report for a date range
 */
export const getConsumptionReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const fuelType = req.query.fuel_type as string;
    const projectId = req.query.project_id as string;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
      return;
    }

    let whereClause = 'WHERE fr.is_active = TRUE AND fr.requisition_date BETWEEN :startDate AND :endDate';
    const replacements: any = { startDate, endDate };

    if (fuelType) {
      whereClause += ' AND fr.fuel_type = :fuelType';
      replacements.fuelType = fuelType;
    }

    if (projectId) {
      whereClause += ' AND fr.project_id = :projectId';
      replacements.projectId = projectId;
    }

    const query = `
      SELECT
        fr.vehicle_equipment_name,
        fr.fuel_type,
        COUNT(*) as requisitions_count,
        SUM(fr.quantity_liters) as total_liters,
        AVG(fr.unit_price) as avg_unit_price,
        SUM(fr.total_amount) as total_cost,
        p.project_name,
        p.project_number
      FROM fuel_requisitions fr
      LEFT JOIN projects p ON fr.project_id = p.id
      ${whereClause}
      GROUP BY fr.vehicle_equipment_name, fr.fuel_type, p.project_name, p.project_number
      ORDER BY total_cost DESC
    `;

    const consumptionData = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: consumptionData,
      period: {
        start_date: startDate,
        end_date: endDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate consumption report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create new fuel requisition
 */
export const createRequisition = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const requisitionData = req.body;

    // Generate requisition code if not provided
    if (!requisitionData.requisition_code) {
      const [result] = await sequelize.query(
        "SELECT CONCAT('FR-', LPAD(IFNULL(MAX(CAST(SUBSTRING(requisition_code, 4) AS UNSIGNED)), 0) + 1, 6, '0')) as next_code FROM fuel_requisitions WHERE requisition_code LIKE 'FR-%'",
        { type: QueryTypes.SELECT, transaction }
      ) as any;
      requisitionData.requisition_code = result.next_code;
    }

    // Calculate total amount if not provided
    if (!requisitionData.total_amount && requisitionData.quantity_liters && requisitionData.unit_price) {
      requisitionData.total_amount = requisitionData.quantity_liters * requisitionData.unit_price;
    }

    const requisition = await FuelRequisition.create({
      ...requisitionData,
      created_by: userId,
      modified_by: userId,
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Fuel requisition created successfully',
      data: requisition,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create fuel requisition',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update fuel requisition
 */
export const updateRequisition = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate total amount if quantity or price changed
    if (updateData.quantity_liters || updateData.unit_price) {
      const [existing] = await FuelRequisition.findAll({ where: { id, is_active: true } });
      if (existing) {
        const quantity = updateData.quantity_liters || existing.quantity_liters;
        const price = updateData.unit_price || existing.unit_price;
        updateData.total_amount = quantity * price;
      }
    }

    const [affectedRows] = await FuelRequisition.update(
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
        message: 'Fuel requisition not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Fuel requisition updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update fuel requisition',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update requisition status (pending → approved → delivered)
 */
export const updateRequisitionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { requisition_status } = req.body;

    if (!['pending', 'approved', 'delivered', 'cancelled'].includes(requisition_status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid requisition status',
      });
      return;
    }

    const updateData: any = {
      requisition_status,
      modified_by: userId,
    };

    // Update approved_by and approved_date when status changes to approved
    if (requisition_status === 'approved') {
      updateData.approved_by = userId;
      updateData.approved_date = new Date();
    }

    // Update delivered_date when status changes to delivered
    if (requisition_status === 'delivered') {
      updateData.delivered_date = new Date();
    }

    const [affectedRows] = await FuelRequisition.update(
      updateData,
      {
        where: { id, is_active: true },
      }
    );

    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Fuel requisition not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Requisition status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update requisition status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Soft delete fuel requisition
 */
export const deleteRequisition = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const [affectedRows] = await FuelRequisition.update(
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
        message: 'Fuel requisition not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Fuel requisition deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete fuel requisition',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
