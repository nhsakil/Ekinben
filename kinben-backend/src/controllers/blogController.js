import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

// Get all blog posts with pagination and filters
export const getBlogPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status = 'published', sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM blog_posts WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Filter by status
    if (status && status !== 'all') {
      queryText += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Search by title or excerpt
    if (search) {
      queryText += ` AND (title ILIKE $${paramCount} OR excerpt ILIKE $${paramCount + 1} OR content ILIKE $${paramCount + 2})`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
      paramCount += 3;
    }

    // Sort
    if (sort === 'newest') {
      queryText += ' ORDER BY published_at DESC NULLS LAST, created_at DESC';
    } else if (sort === 'oldest') {
      queryText += ' ORDER BY published_at ASC, created_at ASC';
    } else if (sort === 'popular') {
      queryText += ' ORDER BY view_count DESC';
    }

    // Get total count
    let countQueryText = 'SELECT COUNT(*) as total FROM blog_posts WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (status && status !== 'all') {
      countQueryText += ` AND status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }
    if (search) {
      countQueryText += ` AND (title ILIKE $${countParamCount} OR excerpt ILIKE $${countParamCount + 1} OR content ILIKE $${countParamCount + 2})`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam);
    }

    const countResult = await query(countQueryText, countParams);
    const total = parseInt(countResult.rows[0].total);

    queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Get blog post by ID
export const getBlogPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM blog_posts WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new AppError('Blog post not found', 404, 'NOT_FOUND');
    }

    // Increment view count
    await query('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1', [id]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get blog post by slug
export const getBlogPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const result = await query(
      'SELECT * FROM blog_posts WHERE slug = $1 AND status = $2',
      [slug, 'published']
    );

    if (result.rows.length === 0) {
      throw new AppError('Blog post not found', 404, 'NOT_FOUND');
    }

    const post = result.rows[0];

    // Increment view count
    await query('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1', [post.id]);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// Create blog post (Admin only)
export const createBlogPost = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { title, slug, excerpt, content, category, tags, featured_image_url, is_featured } = req.body;

    // Validate required fields
    if (!title || !slug || !content) {
      throw new AppError('Title, slug, and content are required', 400, 'VALIDATION_ERROR');
    }

    const id = uuidv4();
    const now = new Date();

    const result = await query(
      `INSERT INTO blog_posts
       (id, title, slug, excerpt, content, author_id, featured_image_url, category, tags, status, is_featured, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [id, title, slug, excerpt, content, userId, featured_image_url, category, tags, 'draft', is_featured || false, now, now]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Blog post created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update blog post (Admin only)
export const updateBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, category, tags, featured_image_url, status, is_featured } = req.body;

    // Check if post exists
    const checkResult = await query('SELECT id FROM blog_posts WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      throw new AppError('Blog post not found', 404, 'NOT_FOUND');
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      updateValues.push(title);
      paramCount++;
    }
    if (slug !== undefined) {
      updateFields.push(`slug = $${paramCount}`);
      updateValues.push(slug);
      paramCount++;
    }
    if (excerpt !== undefined) {
      updateFields.push(`excerpt = $${paramCount}`);
      updateValues.push(excerpt);
      paramCount++;
    }
    if (content !== undefined) {
      updateFields.push(`content = $${paramCount}`);
      updateValues.push(content);
      paramCount++;
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramCount}`);
      updateValues.push(category);
      paramCount++;
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${paramCount}`);
      updateValues.push(tags);
      paramCount++;
    }
    if (featured_image_url !== undefined) {
      updateFields.push(`featured_image_url = $${paramCount}`);
      updateValues.push(featured_image_url);
      paramCount++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(status);
      paramCount++;
    }
    if (is_featured !== undefined) {
      updateFields.push(`is_featured = $${paramCount}`);
      updateValues.push(is_featured);
      paramCount++;
    }

    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());
    paramCount++;

    updateValues.push(id);

    const updateQuery = `UPDATE blog_posts SET ${updateFields.join(', ')} WHERE id = $${paramCount}`;
    await query(updateQuery, updateValues);

    res.json({
      success: true,
      message: 'Blog post updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete blog post (Admin only)
export const deleteBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM blog_posts WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new AppError('Blog post not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

