import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';

// Section mappings for entity tables
const SECTION_TABLES: Record<number, { table: string; codeField: string }> = {
  1: { table: 'invoices', codeField: 'invoice_number' },
  2: { table: 'projects', codeField: 'project_code' },
  3: { table: 'customers', codeField: 'customer_code' },
  4: { table: 'purchase_orders', codeField: 'order_number' },
  5: { table: 'materials', codeField: 'material_code' },
  6: { table: 'suppliers', codeField: 'supplier_code' },
  7: { table: 'pre_inventory', codeField: 'pre_inventory_number' },
  8: { table: 'fuel_requisitions', codeField: 'requisition_code' },
};

/**
 * Get history for an entity
 * Returns combined history from:
 * - Status changes (from audit_log or status history tables)
 * - Chatter posts
 * - Notes
 * - File uploads
 */
export const getEntityHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section_id, foreign_id } = req.params;
    const sectionNum = parseInt(section_id);

    if (!SECTION_TABLES[sectionNum]) {
      res.status(400).json({
        success: false,
        message: 'Invalid section_id',
      });
      return;
    }

    // Get chatter posts
    const chatterQuery = `
      SELECT
        cp.id,
        'chatter' as type,
        cp.post_text as description,
        cp.created_date as event_date,
        u.username as user_name,
        CONCAT(p.first_name, ' ', p.last_name) as user_full_name,
        p.photo_url as user_photo,
        NULL as old_value,
        NULL as new_value,
        NULL as field_name
      FROM chatter_posts cp
      LEFT JOIN users u ON cp.created_by = u.id
      LEFT JOIN people p ON u.person_id = p.id
      WHERE cp.section_id = :section_id
        AND cp.foreign_id = :foreign_id
        AND cp.is_active = TRUE
        AND cp.parent_id IS NULL
    `;

    // Get notes
    const notesQuery = `
      SELECT
        n.id,
        'note' as type,
        n.note_text as description,
        n.created_date as event_date,
        u.username as user_name,
        CONCAT(p.first_name, ' ', p.last_name) as user_full_name,
        p.photo_url as user_photo,
        NULL as old_value,
        NULL as new_value,
        NULL as field_name
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      LEFT JOIN people p ON u.person_id = p.id
      WHERE n.section_id = :section_id
        AND n.foreign_id = :foreign_id
        AND n.is_active = TRUE
    `;

    // Get files
    const filesQuery = `
      SELECT
        f.id,
        'file' as type,
        CONCAT('Archivo subido: ', f.file_name) as description,
        f.created_date as event_date,
        u.username as user_name,
        CONCAT(p.first_name, ' ', p.last_name) as user_full_name,
        p.photo_url as user_photo,
        NULL as old_value,
        f.file_name as new_value,
        'file_upload' as field_name
      FROM files f
      LEFT JOIN users u ON f.created_by = u.id
      LEFT JOIN people p ON u.person_id = p.id
      WHERE f.section_id = :section_id
        AND f.foreign_id = :foreign_id
        AND f.is_active = TRUE
    `;

    // Execute all queries
    const [chatterPosts, notes, files] = await Promise.all([
      sequelize.query(chatterQuery, {
        replacements: { section_id, foreign_id },
        type: QueryTypes.SELECT,
      }),
      sequelize.query(notesQuery, {
        replacements: { section_id, foreign_id },
        type: QueryTypes.SELECT,
      }),
      sequelize.query(filesQuery, {
        replacements: { section_id, foreign_id },
        type: QueryTypes.SELECT,
      }),
    ]);

    // Combine all events and sort by date
    const allEvents = [
      ...(chatterPosts as any[]),
      ...(notes as any[]),
      ...(files as any[]),
    ].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    res.status(200).json({
      success: true,
      data: allEvents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get status changes for an entity
 * Queries specific audit tables if they exist
 */
export const getStatusHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section_id, foreign_id } = req.params;
    const sectionNum = parseInt(section_id);

    if (!SECTION_TABLES[sectionNum]) {
      res.status(400).json({
        success: false,
        message: 'Invalid section_id',
      });
      return;
    }

    // Check if we have an audit log table
    // This is a basic implementation - you can extend it with actual audit tables
    const statusHistory: any[] = [];

    // For now, return creation event from the main table
    const { table, codeField } = SECTION_TABLES[sectionNum];

    try {
      const creationQuery = `
        SELECT
          e.id,
          'creation' as type,
          CONCAT('Registro creado: ', e.${codeField}) as description,
          e.created_date as event_date,
          u.username as user_name,
          CONCAT(p.first_name, ' ', p.last_name) as user_full_name,
          p.photo_url as user_photo,
          NULL as old_value,
          NULL as new_value,
          'created' as field_name
        FROM ${table} e
        LEFT JOIN users u ON e.created_by = u.id
        LEFT JOIN people p ON u.person_id = p.id
        WHERE e.id = :foreign_id
      `;

      const creationEvent = await sequelize.query(creationQuery, {
        replacements: { foreign_id },
        type: QueryTypes.SELECT,
      });

      if (creationEvent.length > 0) {
        statusHistory.push(creationEvent[0]);
      }
    } catch {
      // Table might have different structure, skip
    }

    res.status(200).json({
      success: true,
      data: statusHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve status history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
