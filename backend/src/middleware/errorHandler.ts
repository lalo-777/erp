import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyPattern?: Record<string, number>;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // MySQL duplicate key error
  if (err.code === 1062) {
    statusCode = 400;
    message = 'Duplicate entry. Record already exists.';
  }

  // MySQL foreign key constraint error
  if (err.code === 1451) {
    statusCode = 400;
    message = 'Cannot delete record. It is referenced by other records.';
  }

  // MySQL foreign key constraint error (parent missing)
  if (err.code === 1452) {
    statusCode = 400;
    message = 'Invalid reference. Related record does not exist.';
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Duplicate entry. Record already exists.';
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference. Related record does not exist.';
  }

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
