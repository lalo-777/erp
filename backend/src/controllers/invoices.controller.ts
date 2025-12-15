import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { Invoice } from '../models/mysql/Invoice';

/**
 * Get all invoices with pagination and search
 */
export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';

    let whereClause = 'WHERE i.is_active = TRUE';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND (i.invoice_number LIKE :search OR c.company_name LIKE :search)';
      replacements.search = `%${search}%`;
    }

    const query = `
      SELECT
        i.*,
        c.company_name,
        c.rfc as customer_rfc,
        it.name as invoice_type_name,
        ist.name as status_name,
        ist.alias as status_alias,
        p.project_name,
        u.username as created_by_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN cat_invoice_types it ON i.invoice_type_id = it.id
      LEFT JOIN cat_invoice_statuses ist ON i.invoice_status_id = ist.id
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
      ${whereClause}
      ORDER BY i.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const invoices = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ${whereClause}
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: { search: replacements.search },
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: invoices,
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
      message: 'Failed to retrieve invoices',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get invoice by ID with details
 */
export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        i.*,
        c.company_name,
        c.rfc as customer_rfc,
        c.email as customer_email,
        c.phone as customer_phone,
        it.name as invoice_type_name,
        ist.name as status_name,
        ist.alias as status_alias,
        p.project_name,
        p.project_code,
        u.username as created_by_name,
        um.username as modified_by_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN cat_invoice_types it ON i.invoice_type_id = it.id
      LEFT JOIN cat_invoice_statuses ist ON i.invoice_status_id = ist.id
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN users um ON i.modified_by = um.id
      WHERE i.id = :id AND i.is_active = TRUE
    `;

    const invoices = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (invoices.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: invoices[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get invoice statistics
 */
export const getInvoiceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_invoices,
        SUM(CASE WHEN ist.alias = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
        SUM(CASE WHEN ist.alias = 'pending' THEN 1 ELSE 0 END) as pending_invoices,
        SUM(CASE WHEN ist.alias = 'overdue' THEN 1 ELSE 0 END) as overdue_invoices,
        SUM(CASE WHEN ist.alias = 'cancelled' THEN 1 ELSE 0 END) as cancelled_invoices,
        SUM(i.total_amount) as total_amount,
        SUM(CASE WHEN ist.alias = 'paid' THEN i.total_amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN ist.alias = 'pending' THEN i.total_amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN ist.alias = 'overdue' THEN i.total_amount ELSE 0 END) as overdue_amount,
        AVG(i.total_amount) as average_invoice_amount
      FROM invoices i
      LEFT JOIN cat_invoice_statuses ist ON i.invoice_status_id = ist.id
      WHERE i.is_active = TRUE
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
      message: 'Failed to retrieve invoice statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create new invoice
 */
export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const invoiceData = req.body;

    // Generate invoice number if not provided
    if (!invoiceData.invoice_number) {
      const [result] = await sequelize.query(
        "SELECT CONCAT('INV-', LPAD(IFNULL(MAX(CAST(SUBSTRING(invoice_number, 5) AS UNSIGNED)), 0) + 1, 6, '0')) as next_number FROM invoices WHERE invoice_number LIKE 'INV-%'",
        { type: QueryTypes.SELECT, transaction }
      ) as any;
      invoiceData.invoice_number = result.next_number;
    }

    const invoice = await Invoice.create({
      ...invoiceData,
      created_by: userId,
      modified_by: userId,
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const updateData = req.body;

    // Set session variables for audit trigger
    await sequelize.query('SET @user_id = :userId', {
      replacements: { userId },
    });
    await sequelize.query('SET @change_date = NOW()');

    const [affectedRows] = await Invoice.update(
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
        message: 'Invoice not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Soft delete invoice
 */
export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const [affectedRows] = await Invoice.update(
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
        message: 'Invoice not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get invoice change history
 */
export const getInvoiceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        il.*,
        u.username as changed_by_name
      FROM invoices_log il
      LEFT JOIN users u ON il.user_id = u.id
      WHERE il.invoice_id = :id
      ORDER BY il.change_date DESC
    `;

    const history = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
