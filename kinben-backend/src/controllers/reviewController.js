import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const createReview = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { productId, rating, title, comment } = req.body;

    // Validation
    if (!productId || !rating || !comment) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new AppError('Rating must be an integer between 1 and 5', 400, 'INVALID_RATING');
    }

    if (comment.trim().length < 10) {
      throw new AppError('Comment must be at least 10 characters', 400, 'COMMENT_TOO_SHORT');
    }

    if (comment.length > 5000) {
      throw new AppError('Comment cannot exceed 5000 characters', 400, 'COMMENT_TOO_LONG');
    }

    if (title && title.length > 255) {
      throw new AppError('Title cannot exceed 255 characters', 400, 'TITLE_TOO_LONG');
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, average_rating, total_reviews')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check purchase history: ensure user bought the product and order not cancelled
    // first fetch user's non-cancelled orders
    const { data: userOrders, error: orderErr } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .neq('status', 'cancelled');

    if (orderErr) {
      throw new AppError('Failed to validate purchase history', 500, 'FETCH_ERROR');
    }

    const orderIds = (userOrders || []).map(o => o.id);

    if (orderIds.length === 0) {
      throw new AppError('You can only review products you have purchased', 403, 'NOT_PURCHASED');
    }

    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('product_id', productId)
      .in('order_id', orderIds);

    if (itemsErr) {
      throw new AppError('Failed to validate purchase history', 500, 'FETCH_ERROR');
    }

    if (!items || items.length === 0) {
      throw new AppError('You can only review products you have purchased', 403, 'NOT_PURCHASED');
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      throw new AppError('You have already reviewed this product', 409, 'REVIEW_EXISTS');
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        product_id: productId,
        user_id: userId,
        rating,
        title: title || null,
        comment,
        status: 'pending',
        verified_purchase: false
      }])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create review', 500, 'CREATE_ERROR');
    }

    // Fetch user info for response
    const { data: user } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', userId)
      .single();

    res.status(201).json({
      success: true,
      data: {
        ...review,
        user
      },
      message: 'Review submitted successfully. Awaiting approval.'
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sort || 'newest'; // newest, helpful, rating
    const filterRating = parseInt(req.query.rating) || 0; // 0 = all

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Build query
    let query = supabase
      .from('reviews')
      .select('*, users(id, first_name, last_name)', { count: 'exact' })
      .eq('product_id', productId)
      .eq('status', 'approved');

    // Filter by rating if specified
    if (filterRating > 0) {
      query = query.eq('rating', filterRating);
    }

    // Sort
    switch (sortBy) {
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Paginate
    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      throw new AppError('Failed to fetch reviews', 500, 'FETCH_ERROR');
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: reviews || [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    // Verify ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id, product_id')
      .eq('id', reviewId)
      .single();

    if (!review) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    if (review.user_id !== userId) {
      throw new AppError('Not authorized to update this review', 403, 'FORBIDDEN');
    }

    // Validate data
    if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      throw new AppError('Rating must be an integer between 1 and 5', 400, 'INVALID_RATING');
    }

    if (comment && comment.trim().length < 10) {
      throw new AppError('Comment must be at least 10 characters', 400, 'COMMENT_TOO_SHORT');
    }

    if (comment && comment.length > 5000) {
      throw new AppError('Comment cannot exceed 5000 characters', 400, 'COMMENT_TOO_LONG');
    }

    if (title && title.length > 255) {
      throw new AppError('Title cannot exceed 255 characters', 400, 'TITLE_TOO_LONG');
    }

    // Build update object
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;
    updateData.updated_at = new Date().toISOString();

    // Update review
    const { data: updated, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select('*, users(id, first_name, last_name), status, product_id')
      .single();

    // if rating changed and review is approved, recalc product aggregates
    if (updated.status === 'approved' && rating !== undefined) {
      const { data: approvedReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', updated.product_id)
        .eq('status', 'approved');
      if (approvedReviews.length) {
        const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
        await supabase
          .from('products')
          .update({
            average_rating: parseFloat(avgRating.toFixed(2)),
            total_reviews: approvedReviews.length
          })
          .eq('id', updated.product_id);
      }
    }

    if (error) {
      throw new AppError('Failed to update review', 500, 'UPDATE_ERROR');
    }

    res.json({
      success: true,
      data: updated,
      message: 'Review updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { reviewId } = req.params;

    // Verify ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id, product_id')
      .eq('id', reviewId)
      .single();

    if (!review) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    if (review.user_id !== userId) {
      throw new AppError('Not authorized to delete this review', 403, 'FORBIDDEN');
    }

    // Delete review
    const wasApproved = review.status === 'approved';
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      throw new AppError('Failed to delete review', 500, 'DELETE_ERROR');
    }

    // if approved, recalc product aggregates
    if (wasApproved) {
      const { data: approvedReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', review.product_id)
        .eq('status', 'approved');

      const avgRating = approvedReviews.length
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;

      await supabase
        .from('products')
        .update({
          average_rating: parseFloat(avgRating.toFixed(2)),
          total_reviews: approvedReviews.length
        })
        .eq('id', review.product_id);
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const markHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body;

    if (helpful === undefined) {
      throw new AppError('helpful field is required', 400, 'VALIDATION_ERROR');
    }

    // Get current review
    const { data: review } = await supabase
      .from('reviews')
      .select('helpful_count, unhelpful_count')
      .eq('id', reviewId)
      .single();

    if (!review) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    // Update counts
    const updateData = {
      helpful_count: helpful ? review.helpful_count + 1 : review.helpful_count,
      unhelpful_count: helpful ? review.unhelpful_count : review.unhelpful_count + 1
    };

    const { data: updated, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update helpful votes', 500, 'UPDATE_ERROR');
    }

    res.json({
      success: true,
      data: {
        helpful_count: updated.helpful_count,
        unhelpful_count: updated.unhelpful_count
      },
      message: 'Thank you for your feedback'
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
export const getReviewsForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select('*, products(id, name), users(id, first_name, last_name)', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError('Failed to fetch reviews for moderation', 500, 'FETCH_ERROR');
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: reviews || [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const approveReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const { data: review } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', reviewId)
      .single();

    if (!review) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    // Approve review
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', reviewId);

    if (error) {
      throw new AppError('Failed to approve review', 500, 'UPDATE_ERROR');
    }

    // Recalculate product rating
    const { data: approvedReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', review.product_id)
      .eq('status', 'approved');

    if (approvedReviews && approvedReviews.length > 0) {
      const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
      await supabase
        .from('products')
        .update({
          average_rating: parseFloat(avgRating.toFixed(2)),
          total_reviews: approvedReviews.length
        })
        .eq('id', review.product_id);
    }

    res.json({
      success: true,
      message: 'Review approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const rejectReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const { data: review } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', reviewId)
      .single();

    if (!review) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    // Reject review
    const { error } = await supabase
      .from('reviews')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (error) {
      throw new AppError('Failed to reject review', 500, 'UPDATE_ERROR');
    }

    res.json({
      success: true,
      message: 'Review rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getReviewsForModeration,
  approveReview,
  rejectReview
};
