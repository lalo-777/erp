import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { UserMySQL } from '../models/mysql/UserMySQL';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';

    let whereClause = 'WHERE 1=1';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND (u.email LIKE :search OR u.username LIKE :search OR u.lastname LIKE :search)';
      replacements.search = `%${search}%`;
    }

    const query = `
      SELECT
        u.id,
        u.person_id,
        u.role_id,
        u.email,
        u.username,
        u.lastname,
        u.usr_active,
        u.expiration_date,
        u.is_generic,
        u.created,
        u.modified,
        r.role_name,
        p.person_names,
        p.last_name1,
        p.last_name2
      FROM users u
      LEFT JOIN cat_roles r ON u.role_id = r.id
      LEFT JOIN people p ON u.person_id = p.id
      ${whereClause}
      ORDER BY u.created DESC
      LIMIT :limit OFFSET :offset
    `;

    const users = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const [{ total }] = await sequelize.query(countQuery, {
      replacements: { search: replacements.search },
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: users,
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
      message: 'Failed to retrieve users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        u.id,
        u.person_id,
        u.role_id,
        u.email,
        u.username,
        u.lastname,
        u.usr_active,
        u.expiration_date,
        u.is_generic,
        u.created,
        u.modified,
        r.role_name,
        p.person_names,
        p.last_name1,
        p.last_name2,
        p.phone1,
        p.phone2
      FROM users u
      LEFT JOIN cat_roles r ON u.role_id = r.id
      LEFT JOIN people p ON u.person_id = p.id
      WHERE u.id = :id
    `;

    const [user] = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    }) as any;

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { person_id, role_id, email, usr_password, username, lastname, usr_active, expiration_date, is_generic } = req.body;

    // Validate required fields
    if (!person_id || !email || !usr_password || !username || !lastname) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: person_id, email, usr_password, username, lastname',
      });
      return;
    }

    // Check if email already exists
    const existingUser = await UserMySQL.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email already in use',
      });
      return;
    }

    const user = await UserMySQL.create({
      person_id,
      role_id: role_id || 1,
      email,
      usr_password,
      username,
      lastname,
      usr_active: usr_active !== undefined ? usr_active : 1,
      expiration_date: expiration_date || null,
      is_generic: is_generic || 0,
    });

    // Return user without password
    const { usr_password: _, ...userWithoutPassword } = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { person_id, role_id, email, username, lastname, usr_active, expiration_date, is_generic } = req.body;

    const user = await UserMySQL.findByPk(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await UserMySQL.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Email already in use',
        });
        return;
      }
    }

    // Update only provided fields
    const updateData: any = {};
    if (person_id !== undefined) updateData.person_id = person_id;
    if (role_id !== undefined) updateData.role_id = role_id;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (lastname !== undefined) updateData.lastname = lastname;
    if (usr_active !== undefined) updateData.usr_active = usr_active;
    if (expiration_date !== undefined) updateData.expiration_date = expiration_date;
    if (is_generic !== undefined) updateData.is_generic = is_generic;

    await user.update(updateData);

    // Return user without password
    const { usr_password: _, ...userWithoutPassword } = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await UserMySQL.findByPk(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Soft delete by deactivating the user
    await user.update({ usr_active: 0 });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN usr_active = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN usr_active = 0 THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN is_generic = 1 THEN 1 ELSE 0 END) as generic_users,
        SUM(CASE WHEN created >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as new_this_month
      FROM users
    `;

    const [stats] = await sequelize.query(statsQuery, {
      type: QueryTypes.SELECT,
    }) as any;

    // Get users by role
    const roleStatsQuery = `
      SELECT
        r.role_name,
        COUNT(u.id) as user_count
      FROM cat_roles r
      LEFT JOIN users u ON r.id = u.role_id AND u.usr_active = 1
      GROUP BY r.id, r.role_name
      ORDER BY user_count DESC
    `;

    const roleStats = await sequelize.query(roleStatsQuery, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        by_role: roleStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
