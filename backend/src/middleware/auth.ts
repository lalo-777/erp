import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { UserMySQL } from '../models/mysql/UserMySQL';
import { TokenPayload } from '../utils/jwt';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

    // Check if user still exists
    const userId = parseInt(decoded.userId, 10);
    const user = await UserMySQL.findByPk(userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
      return;
    }

    if (user.usr_active !== 1) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive.',
      });
      return;
    }

    // Check expiration date
    if (user.expiration_date && new Date() > user.expiration_date) {
      res.status(401).json({
        success: false,
        message: 'User account has expired.',
      });
      return;
    }

    // Attach user information to request object (extended via custom type definitions)
    (req as any).user = user;
    (req as any).userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const authorize = (...roleIds: number[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as UserMySQL;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
      return;
    }

    if (!roleIds.includes(user.role_id)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};
