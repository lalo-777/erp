import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { File } from '../models/mysql/File';
import path from 'path';
import fs from 'fs';

/**
 * Upload file
 * Expects multer middleware to handle file upload
 */
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const uploadedFile = req.file;

    if (!uploadedFile) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const { section_id, foreign_id, file_description } = req.body;

    if (!section_id || !foreign_id) {
      res.status(400).json({
        success: false,
        message: 'section_id and foreign_id are required',
      });
      return;
    }

    const file = await File.create({
      section_id: parseInt(section_id),
      foreign_id: parseInt(foreign_id),
      file_name: uploadedFile.originalname,
      file_path: uploadedFile.path,
      file_size: uploadedFile.size,
      file_type: uploadedFile.mimetype,
      file_description: file_description || null,
      uploaded_by: userId,
      created_by: userId,
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: file,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get files by section and foreign_id
 */
export const getFilesByEntity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section_id, foreign_id } = req.params;

    const query = `
      SELECT
        f.*,
        u.username as uploaded_by_name
      FROM files f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE f.section_id = :section_id
        AND f.foreign_id = :foreign_id
        AND f.is_active = TRUE
      ORDER BY f.created_date DESC
    `;

    const files = await sequelize.query(query, {
      replacements: { section_id, foreign_id },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get file by ID
 */
export const getFileById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        f.*,
        u.username as uploaded_by_name
      FROM files f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE f.id = :id AND f.is_active = TRUE
    `;

    const files = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (files.length === 0) {
      res.status(404).json({
        success: false,
        message: 'File not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: files[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Download file
 */
export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const files = await sequelize.query(
      'SELECT * FROM files WHERE id = :id AND is_active = TRUE',
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    if (files.length === 0) {
      res.status(404).json({
        success: false,
        message: 'File not found',
      });
      return;
    }

    const file = files[0];
    const filePath = path.resolve(file.file_path);

    // Check if file exists on disk
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found on disk',
      });
      return;
    }

    res.download(filePath, file.file_name);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update file metadata
 */
export const updateFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { file_description } = req.body;

    const [affectedRows] = await File.update(
      {
        file_description,
        modified_by: userId,
      },
      {
        where: { id, is_active: true },
      }
    );

    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'File not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'File updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Soft delete file
 */
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const [affectedRows] = await File.update(
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
        message: 'File not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
