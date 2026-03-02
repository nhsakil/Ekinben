// Validation utilities for KINBEN API

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Min 8 chars, 1 uppercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone) => {
  // Bangladesh phone number format
  const phoneRegex = /^(?:\+880|0)[1-9]\d{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePostalCode = (code) => {
  return code && code.length > 0 && code.length <= 20;
};

export const validateProductData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!data.price || data.price <= 0) {
    errors.push('Product price must be greater than 0');
  }

  if (!data.category_id) {
    errors.push('Category is required');
  }

  if (!data.sku || data.sku.trim().length === 0) {
    errors.push('SKU is required');
  }

  if (data.stock_quantity !== undefined && data.stock_quantity < 0) {
    errors.push('Stock quantity cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateOrderData = (data) => {
  const errors = [];

  if (!data.shipping_address_id && !data.shippingAddress) {
    errors.push('Shipping address is required');
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (!data.payment_method) {
    errors.push('Payment method is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateReviewData = (data) => {
  const errors = [];

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (!data.comment || data.comment.trim().length === 0) {
    errors.push('Comment is required');
  }

  if (data.comment && data.comment.length > 5000) {
    errors.push('Comment cannot exceed 5000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validatePostalCode,
  validateProductData,
  validateOrderData,
  validateReviewData
};
