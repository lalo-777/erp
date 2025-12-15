import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';

/**
 * Get dashboard statistics
 * Returns aggregated stats for customers, invoices, projects, and materials
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Customer Stats
    const [customerStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN DATE(created_date) >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) AND is_active = 1 THEN 1 ELSE 0 END) as new_this_month
      FROM customers
      WHERE is_active = 1`,
      { type: QueryTypes.SELECT }
    ) as any;

    // Invoice Stats
    const [invoiceStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN invoice_status_id = (SELECT id FROM cat_invoice_statuses WHERE alias = 'paid') THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN invoice_status_id = (SELECT id FROM cat_invoice_statuses WHERE alias = 'pending') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN invoice_status_id = (SELECT id FROM cat_invoice_statuses WHERE alias = 'pending') AND due_date < CURRENT_DATE THEN 1 ELSE 0 END) as overdue,
        COALESCE(SUM(total_amount), 0) as total_amount
      FROM invoices
      WHERE is_active = 1`,
      { type: QueryTypes.SELECT }
    ) as any;

    // Project Stats
    const [projectStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN project_status_id = (SELECT id FROM cat_project_statuses WHERE alias = 'active') THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN project_status_id = (SELECT id FROM cat_project_statuses WHERE alias = 'completed') THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN project_status_id = (SELECT id FROM cat_project_statuses WHERE alias = 'active') THEN 1 ELSE 0 END) as in_progress
      FROM projects
      WHERE is_active = 1`,
      { type: QueryTypes.SELECT }
    ) as any;

    // Material Stats
    const [materialStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total_items,
        SUM(CASE WHEN current_stock < minimum_stock THEN 1 ELSE 0 END) as low_stock_count,
        COALESCE(SUM(current_stock * unit_cost), 0) as total_value
      FROM materials
      WHERE is_active = 1`,
      { type: QueryTypes.SELECT }
    ) as any;

    res.status(200).json({
      success: true,
      data: {
        customers: {
          total: parseInt(customerStats.total) || 0,
          active: parseInt(customerStats.active) || 0,
          new_this_month: parseInt(customerStats.new_this_month) || 0,
        },
        invoices: {
          total: parseInt(invoiceStats.total) || 0,
          paid: parseInt(invoiceStats.paid) || 0,
          pending: parseInt(invoiceStats.pending) || 0,
          overdue: parseInt(invoiceStats.overdue) || 0,
          total_amount: parseFloat(invoiceStats.total_amount) || 0,
        },
        projects: {
          total: parseInt(projectStats.total) || 0,
          active: parseInt(projectStats.active) || 0,
          completed: parseInt(projectStats.completed) || 0,
          in_progress: parseInt(projectStats.in_progress) || 0,
        },
        materials: {
          total_items: parseInt(materialStats.total_items) || 0,
          low_stock_count: parseInt(materialStats.low_stock_count) || 0,
          total_value: parseFloat(materialStats.total_value) || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
