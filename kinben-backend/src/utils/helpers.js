// Helper utilities for KINBEN API

import crypto from 'crypto';

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

export const generatePromoCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const calculateTax = (subtotal, taxRate = 0.15) => {
  return parseFloat((subtotal * taxRate).toFixed(2));
};

export const calculateDiscount = (subtotal, discountPercentage) => {
  if (discountPercentage <= 0 || discountPercentage > 100) return 0;
  return parseFloat((subtotal * (discountPercentage / 100)).toFixed(2));
};

export const calculateOrderTotal = (subtotal, tax = 0, shipping = 0, discount = 0) => {
  return Math.max(0, parseFloat((subtotal + tax + shipping - discount).toFixed(2)));
};

export const formatPrice = (price) => {
  return `৳${parseFloat(price).toFixed(2)}`;
};

export const getPageInfo = (page = 1, limit = 20, total = 0) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const totalPages = Math.ceil(total / limitNum);

  return {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPreviousPage: pageNum > 1,
    offset: (pageNum - 1) * limitNum
  };
};

export const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const sanitizeUser = (user) => {
  if (!user) return null;

  const { password_hash, ...sanitized } = user;
  return sanitized;
};

export const buildFilterQuery = (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.categoryId) {
    conditions.push('category_id = $' + (values.length + 1));
    values.push(filters.categoryId);
  }

  if (filters.minPrice !== undefined) {
    conditions.push('price >= $' + (values.length + 1));
    values.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    conditions.push('price <= $' + (values.length + 1));
    values.push(filters.maxPrice);
  }

  if (filters.search) {
    conditions.push('(name ILIKE $' + (values.length + 1) + ' OR description ILIKE $' + (values.length + 1) + ')');
    values.push(`%${filters.search}%`);
  }

  if (filters.isActive !== undefined) {
    conditions.push('is_active = $' + (values.length + 1));
    values.push(filters.isActive);
  }

  return {
    conditions: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    values
  };
};

export default {
  generateOrderNumber,
  generatePromoCode,
  slugify,
  calculateTax,
  calculateDiscount,
  calculateOrderTotal,
  formatPrice,
  getPageInfo,
  getPaginationParams,
  sanitizeUser,
  buildFilterQuery
};
