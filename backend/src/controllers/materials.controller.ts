import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { Material } from '../models/mysql/Material';

/**
 * Get all materials with pagination and search
 */
export const getAllMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';

    let whereClause = 'WHERE m.is_active = TRUE';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND (m.material_name LIKE :search OR m.material_code LIKE :search OR m.description LIKE :search)';
      replacements.search = `%${search}%`;
    }

    const query = `
      SELECT
        m.*,
        mc.name as category_name,
        uom.name as unit_name,
        uom.alias as unit_alias,
        u.username as created_by_name
      FROM materials m
      LEFT JOIN cat_material_categories mc ON m.material_category_id = mc.id
      LEFT JOIN cat_unit_of_measure uom ON m.unit_of_measure_id = uom.id
      LEFT JOIN users u ON m.created_by = u.id
      ${whereClause}
      ORDER BY m.material_name ASC
      LIMIT :limit OFFSET :offset
    `;

    const materials = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM materials m
      ${whereClause}
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: { search: replacements.search },
      type: QueryTypes.SELECT,
    }) as any;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: materials,
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
      message: 'Failed to retrieve materials',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get material by ID with details
 */
export const getMaterialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        m.*,
        mc.name as category_name,
        uom.name as unit_name,
        uom.alias as unit_alias,
        uc.username as created_by_name,
        um.username as modified_by_name
      FROM materials m
      LEFT JOIN cat_material_categories mc ON m.material_category_id = mc.id
      LEFT JOIN cat_unit_of_measure uom ON m.unit_of_measure_id = uom.id
      LEFT JOIN users uc ON m.created_by = uc.id
      LEFT JOIN users um ON m.modified_by = um.id
      WHERE m.id = :id AND m.is_active = TRUE
    `;

    const materials = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (materials.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Material not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: materials[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve material',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get materials with low stock
 */
export const getLowStockMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        m.*,
        mc.name as category_name,
        uom.name as unit_name,
        (m.minimum_stock - m.current_stock) as stock_deficit
      FROM materials m
      LEFT JOIN cat_material_categories mc ON m.material_category_id = mc.id
      LEFT JOIN cat_unit_of_measure uom ON m.unit_of_measure_id = uom.id
      WHERE m.is_active = TRUE
        AND m.current_stock < m.minimum_stock
      ORDER BY (m.minimum_stock - m.current_stock) DESC
    `;

    const materials = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve low stock materials',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get material statistics
 */
export const getMaterialStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_materials,
        SUM(current_stock * unit_cost) as total_inventory_value,
        SUM(CASE WHEN current_stock < minimum_stock THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN current_stock = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
        AVG(current_stock) as average_stock_level
      FROM materials
      WHERE is_active = TRUE
    `;

    const [stats] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    }) as any;

    // Get materials by category
    const categoryQuery = `
      SELECT
        mc.name as category_name,
        COUNT(*) as count,
        SUM(m.current_stock * m.unit_cost) as category_value
      FROM materials m
      LEFT JOIN cat_material_categories mc ON m.material_category_id = mc.id
      WHERE m.is_active = TRUE
      GROUP BY mc.id, mc.name
      ORDER BY category_value DESC
    `;

    const materialsByCategory = await sequelize.query(categoryQuery, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        materials_by_category: materialsByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve material statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create new material
 */
export const createMaterial = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as any).userId;
    const materialData = req.body;

    // Generate material code if not provided
    if (!materialData.material_code) {
      const [result] = await sequelize.query(
        "SELECT CONCAT('MAT-', LPAD(IFNULL(MAX(CAST(SUBSTRING(material_code, 5) AS UNSIGNED)), 0) + 1, 6, '0')) as next_code FROM materials WHERE material_code LIKE 'MAT-%'",
        { type: QueryTypes.SELECT, transaction }
      ) as any;
      materialData.material_code = result.next_code;
    }

    const material = await Material.create({
      ...materialData,
      created_by: userId,
      modified_by: userId,
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: material,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create material',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update material
 */
export const updateMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const updateData = req.body;

    const [affectedRows] = await Material.update(
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
        message: 'Material not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update material',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Soft delete material
 */
export const deleteMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const [affectedRows] = await Material.update(
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
        message: 'Material not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
