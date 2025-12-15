import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { Customer } from '../models/mysql/Customer';

export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';

    let whereClause = 'WHERE c.is_active = TRUE';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND (c.company_name LIKE :search OR c.rfc LIKE :search OR c.contact_name LIKE :search)';
      replacements.search = `%${search}%`;
    }

    const query = `
      SELECT
        c.*,
        s.state_name,
        u.username as created_by_name
      FROM customers c
      LEFT JOIN cat_states s ON c.state_id = s.id
      LEFT JOIN users u ON c.created_by = u.id
      ${whereClause}
      ORDER BY c.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const customers = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `SELECT COUNT(*) as total FROM customers c ${whereClause}`;
    const [{ total }] = await sequelize.query(countQuery, {
      replacements: { search: replacements.search },
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: customers,
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
      message: 'Failed to retrieve customers',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const customer = await Customer.create({
      ...req.body,
      created_by: userId,
      modified_by: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
      return;
    }

    await customer.update({
      ...req.body,
      modified_by: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
      return;
    }

    await customer.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
