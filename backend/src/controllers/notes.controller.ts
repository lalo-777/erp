import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { Note } from '../models/mysql/Note';

/**
 * Create new note
 */
export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { section_id, foreign_id, note_text } = req.body;

    if (!section_id || !foreign_id || !note_text) {
      res.status(400).json({
        success: false,
        message: 'section_id, foreign_id, and note_text are required',
      });
      return;
    }

    const note = await Note.create({
      section_id: parseInt(section_id),
      foreign_id: parseInt(foreign_id),
      note_text,
      created_by: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get notes by section and foreign_id
 */
export const getNotesByEntity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section_id, foreign_id } = req.params;

    const query = `
      SELECT
        n.*,
        u.username as created_by_name,
        um.username as modified_by_name
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      LEFT JOIN users um ON n.modified_by = um.id
      WHERE n.section_id = :section_id
        AND n.foreign_id = :foreign_id
        AND n.is_active = TRUE
      ORDER BY n.created_date DESC
    `;

    const notes = await sequelize.query(query, {
      replacements: { section_id, foreign_id },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get note by ID
 */
export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        n.*,
        u.username as created_by_name,
        um.username as modified_by_name
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      LEFT JOIN users um ON n.modified_by = um.id
      WHERE n.id = :id AND n.is_active = TRUE
    `;

    const notes = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (notes.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Note not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: notes[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve note',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update note
 */
export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { note_text } = req.body;

    if (!note_text) {
      res.status(400).json({
        success: false,
        message: 'note_text is required',
      });
      return;
    }

    const [affectedRows] = await Note.update(
      {
        note_text,
        modified_by: userId,
      },
      {
        where: { id, is_active: true },
      }
    );

    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Note not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Soft delete note
 */
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const [affectedRows] = await Note.update(
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
        message: 'Note not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all notes by user
 */
export const getNotesByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const query = `
      SELECT
        n.*,
        u.username as created_by_name
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.created_by = :userId
        AND n.is_active = TRUE
      ORDER BY n.created_date DESC
    `;

    const notes = await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
