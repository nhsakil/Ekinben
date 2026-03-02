import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { getPaginationParams, slugify } from '../utils/helpers.js';
import { validateProductData } from '../utils/validators.js';

export const getProducts = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { category, minPrice, maxPrice, search, sort = 'created_at', isActive = true } = req.query;

    let query = supabase
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' });

    // Filters
    if (isActive === true || isActive === 'true') {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('categories.slug', category);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Sorting
    const sortOrder = req.query.order === 'asc' ? 'asc' : 'desc';
    query = query.order(sort, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, count, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch products', 500, 'FETCH_ERROR', error);
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: products,
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

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_images(*), reviews(*, users(first_name, last_name))')
      .eq('id', id)
      .single();

    if (error || !product) {
      throw new AppError('Product not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_images(*), reviews(*, users(first_name, last_name))')
      .eq('slug', slug)
      .single();

    if (error || !product) {
      throw new AppError('Product not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*, products(count)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch categories', 500, 'FETCH_ERROR');
    }

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      throw new AppError('Search query required', 400, 'INVALID_QUERY');
    }

    // Search in products
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, slug, price, is_active')
      .eq('is_active', true)
      .ilike('name', `%${q}%`)
      .limit(parseInt(limit));

    if (productError) {
      throw new AppError('Search failed', 500, 'SEARCH_ERROR');
    }

    res.json({
      success: true,
      data: {
        results: products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin functions
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, categoryId, sku, price, comparePrice, stock, color, material } = req.body;

    // Validate
    const validation = validateProductData({ name, price, category_id: categoryId, sku });
    if (!validation.isValid) {
      throw new AppError(validation.errors.join(', '), 400, 'VALIDATION_ERROR');
    }

    const slug = slugify(name);

    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        name,
        slug,
        description,
        category_id: categoryId,
        sku,
        price: parseFloat(price),
        compare_price: comparePrice ? parseFloat(comparePrice) : null,
        stock_quantity: stock || 0,
        color,
        material
      }])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create product', 500, 'CREATE_ERROR', error.message);
    }

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.created_at;
    delete updates.sku; // SKU shouldn't change

    const { data: product, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !product) {
      throw new AppError('Product not found or update failed', 404, 'UPDATE_ERROR');
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('Product not found or delete failed', 404, 'DELETE_ERROR');
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProducts,
  getProductById,
  getProductBySlug,
  getCategories,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
