import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { ChatterPost } from '../models/mysql/ChatterPost';

/**
 * Create new chatter post
 */
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { section_id, foreign_id, post_text, mentions, parent_id } = req.body;

    if (!section_id || !foreign_id || !post_text) {
      res.status(400).json({
        success: false,
        message: 'section_id, foreign_id, and post_text are required',
      });
      return;
    }

    const post = await ChatterPost.create({
      section_id: parseInt(section_id),
      foreign_id: parseInt(foreign_id),
      post_text,
      mentions: mentions ? JSON.stringify(mentions) : null,
      parent_id: parent_id ? parseInt(parent_id) : null,
      created_by: userId,
    });

    // Get full post data with user info
    const query = `
      SELECT
        cp.*,
        u.username as created_by_name,
        CONCAT(p.first_name, ' ', p.last_name) as created_by_full_name,
        p.photo_url as created_by_photo
      FROM chatter_posts cp
      LEFT JOIN users u ON cp.created_by = u.id
      LEFT JOIN people p ON u.person_id = p.id
      WHERE cp.id = :postId
    `;

    const posts = await sequelize.query(query, {
      replacements: { postId: post.id },
      type: QueryTypes.SELECT,
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: posts[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get posts by entity (section_id + foreign_id)
 */
export const getPostsByEntity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section_id, foreign_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get total count
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM chatter_posts
       WHERE section_id = :section_id AND foreign_id = :foreign_id AND is_active = TRUE AND parent_id IS NULL`,
      {
        replacements: { section_id, foreign_id },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    const total = countResult[0]?.total || 0;

    // Get posts with user info
    const query = `
      SELECT
        cp.*,
        u.username as created_by_name,
        CONCAT(p.first_name, ' ', p.last_name) as created_by_full_name,
        p.photo_url as created_by_photo,
        (SELECT COUNT(*) FROM chatter_posts r WHERE r.parent_id = cp.id AND r.is_active = TRUE) as replies_count
      FROM chatter_posts cp
      LEFT JOIN users u ON cp.created_by = u.id
      LEFT JOIN people p ON u.person_id = p.id
      WHERE cp.section_id = :section_id
        AND cp.foreign_id = :foreign_id
        AND cp.is_active = TRUE
        AND cp.parent_id IS NULL
      ORDER BY cp.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const posts = await sequelize.query(query, {
      replacements: { section_id, foreign_id, limit: limitNum, offset },
      type: QueryTypes.SELECT,
    });

    // Parse mentions for each post
    const postsWithMentions = (posts as any[]).map((post) => ({
      ...post,
      mentions: post.mentions ? JSON.parse(post.mentions) : [],
    }));

    res.status(200).json({
      success: true,
      data: postsWithMentions,
      pagination: {
        currentPage: pageNum,
        itemsPerPage: limitNum,
        totalItems: total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve posts',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get replies to a post
 */
export const getReplies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        cp.*,
        u.username as created_by_name,
        CONCAT(p.first_name, ' ', p.last_name) as created_by_full_name,
        p.photo_url as created_by_photo
      FROM chatter_posts cp
      LEFT JOIN users u ON cp.created_by = u.id
      LEFT JOIN people p ON u.person_id = p.id
      WHERE cp.parent_id = :parentId
        AND cp.is_active = TRUE
      ORDER BY cp.created_date ASC
    `;

    const replies = await sequelize.query(query, {
      replacements: { parentId: id },
      type: QueryTypes.SELECT,
    });

    // Parse mentions
    const repliesWithMentions = (replies as any[]).map((reply) => ({
      ...reply,
      mentions: reply.mentions ? JSON.parse(reply.mentions) : [],
    }));

    res.status(200).json({
      success: true,
      data: repliesWithMentions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve replies',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update post
 */
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { post_text, mentions } = req.body;

    if (!post_text) {
      res.status(400).json({
        success: false,
        message: 'post_text is required',
      });
      return;
    }

    // Check if user owns the post
    const existingPost = await ChatterPost.findOne({
      where: { id, is_active: true },
    });

    if (!existingPost) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    if (existingPost.created_by !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only edit your own posts',
      });
      return;
    }

    await ChatterPost.update(
      {
        post_text,
        mentions: mentions ? JSON.stringify(mentions) : existingPost.mentions,
        modified_by: userId,
        modified_date: new Date(),
      },
      {
        where: { id },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Soft delete post
 */
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Check if user owns the post
    const existingPost = await ChatterPost.findOne({
      where: { id, is_active: true },
    });

    if (!existingPost) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    if (existingPost.created_by !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
      return;
    }

    await ChatterPost.update(
      {
        is_active: false,
        modified_by: userId,
        modified_date: new Date(),
      },
      {
        where: { id },
      }
    );

    // Also soft delete all replies
    await ChatterPost.update(
      {
        is_active: false,
        modified_by: userId,
        modified_date: new Date(),
      },
      {
        where: { parent_id: id },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Search users for mentions
 */
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    const query = `
      SELECT
        u.id,
        u.username,
        CONCAT(p.first_name, ' ', p.last_name) as full_name,
        p.photo_url
      FROM users u
      LEFT JOIN people p ON u.person_id = p.id
      WHERE u.is_active = TRUE
        AND (
          u.username LIKE :search
          OR p.first_name LIKE :search
          OR p.last_name LIKE :search
          OR CONCAT(p.first_name, ' ', p.last_name) LIKE :search
        )
      LIMIT 10
    `;

    const users = await sequelize.query(query, {
      replacements: { search: `%${q}%` },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
