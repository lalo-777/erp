import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { Project } from '../models/mysql/Project';

/**
 * Get all projects with pagination and search
 */
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';

    let whereClause = 'WHERE p.is_active = TRUE';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND (p.project_name LIKE :search OR p.project_number LIKE :search OR c.company_name LIKE :search)';
      replacements.search = `%${search}%`;
    }

    const query = `
      SELECT
        p.*,
        c.company_name,
        pt.name as project_type_name,
        ps.name as status_name,
        ps.alias as status_alias,
        pa.name as area_name,
        s.state_name,
        u.username as manager_name,
        uc.username as created_by_name
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN cat_project_types pt ON p.project_type_id = pt.id
      LEFT JOIN cat_project_statuses ps ON p.project_status_id = ps.id
      LEFT JOIN cat_project_areas pa ON p.project_area_id = pa.id
      LEFT JOIN cat_states s ON p.location_state_id = s.id
      LEFT JOIN users u ON p.project_manager_id = u.id
      LEFT JOIN users uc ON p.created_by = uc.id
      ${whereClause}
      ORDER BY p.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const projects = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      ${whereClause}
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: { search: replacements.search },
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: projects,
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
      message: 'Failed to retrieve projects',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get project by ID with details
 */
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        p.*,
        c.company_name,
        c.rfc as customer_rfc,
        c.contact_email as customer_email,
        c.contact_phone as customer_phone,
        pt.name as project_type_name,
        ps.name as status_name,
        ps.alias as status_alias,
        pa.name as area_name,
        s.state_name,
        u.username as manager_name,
        u.email as manager_email,
        uc.username as created_by_name,
        um.username as modified_by_name
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN cat_project_types pt ON p.project_type_id = pt.id
      LEFT JOIN cat_project_statuses ps ON p.project_status_id = ps.id
      LEFT JOIN cat_project_areas pa ON p.project_area_id = pa.id
      LEFT JOIN cat_states s ON p.location_state_id = s.id
      LEFT JOIN users u ON p.project_manager_id = u.id
      LEFT JOIN users uc ON p.created_by = uc.id
      LEFT JOIN users um ON p.modified_by = um.id
      WHERE p.id = :id AND p.is_active = TRUE
    `;

    const projects = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (projects.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: projects[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get project statistics
 */
export const getProjectStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_projects,
        SUM(CASE WHEN ps.alias = 'active' THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN ps.alias = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN ps.alias = 'cancelled' THEN 1 ELSE 0 END) as cancelled_projects,
        SUM(CASE WHEN ps.alias = 'on_hold' THEN 1 ELSE 0 END) as on_hold_projects,
        SUM(p.total_budget) as total_estimated_budget,
        AVG(p.total_budget) as average_budget,
        AVG(DATEDIFF(p.estimated_end_date, p.start_date)) as average_duration_days
      FROM projects p
      LEFT JOIN cat_project_statuses ps ON p.project_status_id = ps.id
      WHERE p.is_active = TRUE
    `;

    const [stats] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    }) as any;

    // Get projects by type
    const typeQuery = `
      SELECT
        pt.name as project_type,
        COUNT(*) as count,
        SUM(p.total_budget) as total_budget
      FROM projects p
      LEFT JOIN cat_project_types pt ON p.project_type_id = pt.id
      WHERE p.is_active = TRUE
      GROUP BY pt.id, pt.name
      ORDER BY count DESC
    `;

    const projectsByType = await sequelize.query(typeQuery, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        total_actual_cost: 0, // Will be calculated from work orders/expenses later
        projects_by_type: projectsByType,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create new project
 */
export const createProject = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const projectData = req.body;

    // Generate project number if not provided
    if (!projectData.project_number) {
      const [result] = await sequelize.query(
        "SELECT CONCAT('PRJ-', LPAD(IFNULL(MAX(CAST(SUBSTRING(project_number, 5) AS UNSIGNED)), 0) + 1, 6, '0')) as next_code FROM projects WHERE project_number LIKE 'PRJ-%'",
        { type: QueryTypes.SELECT, transaction }
      ) as any;
      projectData.project_number = result.next_code;
    }

    const project = await Project.create({
      ...projectData,
      created_by: userId,
      modified_by: userId,
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update project
 */
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const updateData = req.body;

    // Set session variables for audit trigger
    await sequelize.query('SET @user_id = :userId', {
      replacements: { userId },
    });
    await sequelize.query('SET @change_date = NOW()');

    const [affectedRows] = await Project.update(
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
        message: 'Project not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Soft delete project
 */
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const [affectedRows] = await Project.update(
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
        message: 'Project not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get project change history
 */
export const getProjectHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        pl.*,
        u.username as changed_by_name
      FROM projects_log pl
      LEFT JOIN users u ON pl.user_id = u.id
      WHERE pl.project_id = :id
      ORDER BY pl.change_date DESC
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
      message: 'Failed to retrieve project history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
