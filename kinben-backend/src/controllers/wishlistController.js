import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

// Get user's wishlist
export const getWishlist = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get wishlist items with product details
    const result = await query(
      `SELECT
        wi.id,
        wi.user_id,
        wi.product_id,
        wi.added_at,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.compare_price,
        p.average_rating,
        p.total_reviews,
        p.stock_quantity,
        p.is_featured,
        string_agg(pi.image_url, ',') as images
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE wi.user_id = $1
      GROUP BY wi.id, p.id
      ORDER BY wi.added_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM wishlist_items WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].total);

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

// Add item to wishlist
export const addToWishlist = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { productId } = req.body;

    if (!productId) {
      throw new AppError('Product ID is required', 400, 'VALIDATION_ERROR');
    }

    // Check if product exists
    const productResult = await query(
      'SELECT id, name, price FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw new AppError('Product not found', 404, 'NOT_FOUND');
    }

    // Check if already in wishlist
    const existingResult = await query(
      'SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existingResult.rows.length > 0) {
      throw new AppError('Item already in wishlist', 409, 'ALREADY_EXISTS');
    }

    const id = uuidv4();
    const now = new Date();

    const insertResult = await query(
      'INSERT INTO wishlist_items (id, user_id, product_id, added_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userId, productId, now]
    );

    res.status(201).json({
      success: true,
      data: insertResult.rows[0],
      message: 'Item added to wishlist successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { itemId } = req.params;

    const result = await query(
      'DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Wishlist item not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Remove all items from wishlist (clear wishlist)
export const clearWishlist = async (req, res, next) => {
  try {
    const { userId } = req.user;

    await query('DELETE FROM wishlist_items WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Check if product is in wishlist
export const isInWishlist = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { productId } = req.params;

    const result = await query(
      'SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    res.json({
      success: true,
      data: {
        inWishlist: result.rows.length > 0,
        itemId: result.rows[0]?.id || null
      }
    });
  } catch (error) {
    next(error);
  }
};
