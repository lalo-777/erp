import { Request, Response } from 'express';
import { UserMySQL } from '../models/mysql/UserMySQL';
import { LastAccess } from '../models/mysql/LastAccess';
import { HistoricalAccess } from '../models/mysql/HistoricalAccess';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // Find user by email
    const user = await UserMySQL.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if user is active
    if (user.usr_active !== 1) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
      return;
    }

    // Check expiration date
    if (user.expiration_date && new Date() > user.expiration_date) {
      res.status(401).json({
        success: false,
        message: 'User account has expired',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
      roleId: user.role_id.toString(),
      personId: user.person_id.toString(),
    });

    // Track access
    const accessData = {
      user_id: user.id,
      login_datetime: new Date(),
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      session_id: token.substring(0, 50), // Use part of token as session ID
    };

    // Update last access
    await LastAccess.upsert(accessData);

    // Add to historical access
    await HistoricalAccess.create(accessData);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          lastname: user.lastname,
          role_id: user.role_id,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
      return;
    }

    const user = await UserMySQL.findByPk(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    user.usr_password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
