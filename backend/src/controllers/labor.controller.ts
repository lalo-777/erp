import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { LaborTimesheet } from '../models/mysql/LaborTimesheet';

/**
 * Get all labor timesheets with pagination and filters
 */
export const getAllTimesheets = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const projectId = req.query.project_id as string;
    const paymentStatus = req.query.payment_status as string;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    let whereClause = 'WHERE lt.is_active = TRUE';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND (lt.worker_name LIKE :search OR lt.timesheet_code LIKE :search)';
      replacements.search = `%${search}%`;
    }

    if (projectId) {
      whereClause += ' AND lt.project_id = :projectId';
      replacements.projectId = projectId;
    }

    if (paymentStatus) {
      whereClause += ' AND lt.payment_status = :paymentStatus';
      replacements.paymentStatus = paymentStatus;
    }

    if (startDate) {
      whereClause += ' AND lt.work_date >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      whereClause += ' AND lt.work_date <= :endDate';
      replacements.endDate = endDate;
    }

    const query = `
      SELECT
        lt.*,
        p.project_name,
        p.project_code,
        u.username as created_by_name
      FROM labor_timesheets lt
      LEFT JOIN projects p ON lt.project_id = p.id
      LEFT JOIN users u ON lt.created_by = u.id
      ${whereClause}
      ORDER BY lt.work_date DESC, lt.worker_name ASC
      LIMIT :limit OFFSET :offset
    `;

    const timesheets = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM labor_timesheets lt
      ${whereClause}
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: {
        search: replacements.search,
        projectId: replacements.projectId,
        paymentStatus: replacements.paymentStatus,
        startDate: replacements.startDate,
        endDate: replacements.endDate,
      },
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: timesheets,
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
      message: 'Failed to retrieve timesheets',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get timesheet by ID
 */
export const getTimesheetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        lt.*,
        p.project_name,
        p.project_code,
        uc.username as created_by_name,
        um.username as modified_by_name
      FROM labor_timesheets lt
      LEFT JOIN projects p ON lt.project_id = p.id
      LEFT JOIN users uc ON lt.created_by = uc.id
      LEFT JOIN users um ON lt.modified_by = um.id
      WHERE lt.id = :id AND lt.is_active = TRUE
    `;

    const timesheets = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (timesheets.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Timesheet not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: timesheets[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve timesheet',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get labor statistics
 */
export const getLaborStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_timesheets,
        COUNT(DISTINCT worker_name) as total_workers,
        SUM(hours_worked) as total_hours,
        SUM(payment_amount) as total_payroll,
        AVG(hours_worked) as avg_hours_per_day,
        AVG(performance_score) as avg_performance,
        SUM(CASE WHEN payment_status = 'pending' THEN payment_amount ELSE 0 END) as pending_payments,
        SUM(CASE WHEN payment_status = 'approved' THEN payment_amount ELSE 0 END) as approved_payments,
        SUM(CASE WHEN payment_status = 'paid' THEN payment_amount ELSE 0 END) as paid_amount
      FROM labor_timesheets
      WHERE is_active = TRUE
    `;

    const [stats] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    }) as any;

    // Get labor by worker
    const workerQuery = `
      SELECT
        worker_name,
        COUNT(*) as timesheet_count,
        SUM(hours_worked) as total_hours,
        SUM(payment_amount) as total_earnings,
        AVG(performance_score) as avg_performance
      FROM labor_timesheets
      WHERE is_active = TRUE
      GROUP BY worker_name
      ORDER BY total_hours DESC
      LIMIT 10
    `;

    const topWorkers = await sequelize.query(workerQuery, {
      type: QueryTypes.SELECT,
    });

    // Get labor by project
    const projectQuery = `
      SELECT
        p.project_name,
        p.project_code,
        COUNT(*) as timesheet_count,
        SUM(lt.hours_worked) as total_hours,
        SUM(lt.payment_amount) as labor_cost
      FROM labor_timesheets lt
      LEFT JOIN projects p ON lt.project_id = p.id
      WHERE lt.is_active = TRUE AND lt.project_id IS NOT NULL
      GROUP BY p.id, p.project_name, p.project_code
      ORDER BY labor_cost DESC
      LIMIT 10
    `;

    const laborByProject = await sequelize.query(projectQuery, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        top_workers: topWorkers,
        labor_by_project: laborByProject,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve labor statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get payroll report for a date range
 */
export const getPayrollReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const paymentStatus = req.query.payment_status as string;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
      return;
    }

    let whereClause = 'WHERE lt.is_active = TRUE AND lt.work_date BETWEEN :startDate AND :endDate';
    const replacements: any = { startDate, endDate };

    if (paymentStatus) {
      whereClause += ' AND lt.payment_status = :paymentStatus';
      replacements.paymentStatus = paymentStatus;
    }

    const query = `
      SELECT
        lt.worker_name,
        COUNT(*) as days_worked,
        SUM(lt.hours_worked) as total_hours,
        AVG(lt.hourly_rate) as avg_hourly_rate,
        SUM(lt.payment_amount) as total_payment,
        AVG(lt.performance_score) as avg_performance,
        lt.payment_status
      FROM labor_timesheets lt
      ${whereClause}
      GROUP BY lt.worker_name, lt.payment_status
      ORDER BY total_payment DESC
    `;

    const payrollData = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: payrollData,
      period: {
        start_date: startDate,
        end_date: endDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate payroll report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create new timesheet
 */
export const createTimesheet = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const timesheetData = req.body;

    // Generate timesheet code if not provided
    if (!timesheetData.timesheet_code) {
      const [result] = await sequelize.query(
        "SELECT CONCAT('TS-', LPAD(IFNULL(MAX(CAST(SUBSTRING(timesheet_code, 4) AS UNSIGNED)), 0) + 1, 6, '0')) as next_code FROM labor_timesheets WHERE timesheet_code LIKE 'TS-%'",
        { type: QueryTypes.SELECT, transaction }
      ) as any;
      timesheetData.timesheet_code = result.next_code;
    }

    // Calculate payment amount if not provided
    if (!timesheetData.payment_amount && timesheetData.hours_worked && timesheetData.hourly_rate) {
      timesheetData.payment_amount = timesheetData.hours_worked * timesheetData.hourly_rate;
    }

    const timesheet = await LaborTimesheet.create({
      ...timesheetData,
      created_by: userId,
      modified_by: userId,
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Timesheet created successfully',
      data: timesheet,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create timesheet',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update timesheet
 */
export const updateTimesheet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate payment amount if hours or rate changed
    if (updateData.hours_worked || updateData.hourly_rate) {
      const [existing] = await LaborTimesheet.findAll({ where: { id, is_active: true } });
      if (existing) {
        const hours = updateData.hours_worked || existing.hours_worked;
        const rate = updateData.hourly_rate || existing.hourly_rate;
        updateData.payment_amount = hours * rate;
      }
    }

    const [affectedRows] = await LaborTimesheet.update(
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
        message: 'Timesheet not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Timesheet updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update timesheet',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!['pending', 'approved', 'paid'].includes(payment_status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
      return;
    }

    const [affectedRows] = await LaborTimesheet.update(
      {
        payment_status,
        modified_by: userId,
      },
      {
        where: { id, is_active: true },
      }
    );

    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Timesheet not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Soft delete timesheet
 */
export const deleteTimesheet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const [affectedRows] = await LaborTimesheet.update(
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
        message: 'Timesheet not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Timesheet deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete timesheet',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
