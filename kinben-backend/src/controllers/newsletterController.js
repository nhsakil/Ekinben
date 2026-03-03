import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { validateEmail } from '../utils/validators.js';
import { v4 as uuidv4 } from 'uuid';

// Subscribe to newsletter
export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400, 'VALIDATION_ERROR');
    }

    if (!validateEmail(email)) {
      throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
    }

    // Check if already subscribed
    const existingResult = await query(
      'SELECT id, status FROM newsletter_subscriptions WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      const subscription = existingResult.rows[0];

      // If unsubscribed, resubscribe
      if (subscription.status === 'unsubscribed') {
        await query(
          'UPDATE newsletter_subscriptions SET status = $1, unsubscribed_at = NULL, subscribed_at = $2 WHERE email = $3',
          ['subscribed', new Date(), email]
        );
      }

      return res.json({
        success: true,
        message: 'Already subscribed to newsletter'
      });
    }

    const id = uuidv4();
    const now = new Date();

    const result = await query(
      `INSERT INTO newsletter_subscriptions
       (id, email, name, status, subscribed_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, email, name || null, 'subscribed', now, now]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Subscribed to newsletter successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all subscribers (Admin only)
export const getSubscribers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status = 'subscribed', search } = req.query;
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM newsletter_subscriptions WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status && status !== 'all') {
      queryText += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (email ILIKE $${paramCount} OR name ILIKE $${paramCount + 1})`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
      paramCount += 2;
    }

    // Get total count
    let countQueryText = 'SELECT COUNT(*) as total FROM newsletter_subscriptions WHERE 1=1';
    const countParams = [];

    if (status && status !== 'all') {
      countQueryText += ` AND status = $1`;
      countParams.push(status);
    }

    if (search) {
      const paramIdx = status ? 2 : 1;
      countQueryText += ` AND (email ILIKE $${paramIdx} OR name ILIKE $${paramIdx + 1})`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam);
    }

    const countResult = await query(countQueryText, countParams);
    const total = parseInt(countResult.rows[0].total);

    queryText += ` ORDER BY subscribed_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Unsubscribe from newsletter
export const unsubscribeNewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE newsletter_subscriptions SET status = $1, unsubscribed_at = $2 WHERE id = $3',
      ['unsubscribed', new Date(), id]
    );

    if (result.rowCount === 0) {
      throw new AppError('Subscriber not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      message: 'Unsubscribed from newsletter successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Remove subscriber (Admin - Hard delete)
export const removeSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM newsletter_subscriptions WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new AppError('Subscriber not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      message: 'Subscriber removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get newsletter statistics (Admin only)
export const getNewsletterStats = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        COUNT(*) as total_subscribers,
        SUM(CASE WHEN status = 'subscribed' THEN 1 ELSE 0 END) as active_subscribers,
        SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
        COUNT(DISTINCT DATE(subscribed_at)) as subscription_days
      FROM newsletter_subscriptions`
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Batch unsubscribe by email
export const batchUnsubscribe = async (req, res, next) => {
  try {
    const { emails } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      throw new AppError('Emails array is required', 400, 'VALIDATION_ERROR');
    }

    const result = await query(
      `UPDATE newsletter_subscriptions
       SET status = $1, unsubscribed_at = $2
       WHERE email = ANY($3)`,
      ['unsubscribed', new Date(), emails]
    );

    res.json({
      success: true,
      data: {
        unsubscribed_count: result.rowCount
      },
      message: `${result.rowCount} subscribers unsubscribed successfully`
    });
  } catch (error) {
    next(error);
  }
};
