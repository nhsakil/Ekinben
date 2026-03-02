import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { getPaginationParams } from '../utils/helpers.js';

export const getCart = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*, products(id, name, slug, price, stock_quantity, product_images(image_url, is_primary)), product_variants(id, variant_type, variant_value, price)')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch cart', 500, 'FETCH_ERROR');
    }

    // Calculate totals
    let subtotal = 0;
    cartItems.forEach(item => {
      const itemPrice = item.product_variants?.price || item.products?.price || 0;
      subtotal += itemPrice * item.quantity;
    });

    const tax = parseFloat((subtotal * 0.15).toFixed(2)); // 15% tax
    const total = parseFloat((subtotal + tax).toFixed(2));

    res.json({
      success: true,
      data: {
        items: cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax,
        total,
        itemCount: cartItems.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { productId, productVariantId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      throw new AppError('Invalid product or quantity', 400, 'INVALID_INPUT');
    }

    // Check if product exists and has stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .eq('id', productId)
      .single();

    if (!product || productError) {
      throw new AppError('Product not found', 404, 'NOT_FOUND');
    }

    if (product.stock_quantity < quantity) {
      throw new AppError('Insufficient stock', 400, 'OUT_OF_STOCK');
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('product_variant_id', productVariantId || null)
      .single();

    let cartItem;
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock_quantity) {
        throw new AppError('Insufficient stock for requested quantity', 400, 'OUT_OF_STOCK');
      }

      const { data: updated, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateError) {
        throw new AppError('Failed to update cart', 500, 'UPDATE_ERROR');
      }
      cartItem = updated;
    } else {
      // Add new item
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert([{
          user_id: userId,
          product_id: productId,
          product_variant_id: productVariantId || null,
          quantity
        }])
        .select('*, products(name, price), product_variants(price)')
        .single();

      if (insertError) {
        throw new AppError('Failed to add item to cart', 500, 'INSERT_ERROR');
      }
      cartItem = newItem;
    }

    res.json({
      success: true,
      data: cartItem,
      message: 'Item added to cart'
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      throw new AppError('Invalid quantity', 400, 'INVALID_QUANTITY');
    }

    // Get cart item
    const { data: cartItem, error: getError } = await supabase
      .from('cart_items')
      .select('*, products(stock_quantity)')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    if (!cartItem || getError) {
      throw new AppError('Cart item not found', 404, 'NOT_FOUND');
    }

    // Check stock
    if (cartItem.products.stock_quantity < quantity) {
      throw new AppError('Insufficient stock', 400, 'OUT_OF_STOCK');
    }

    // Update quantity
    const { data: updated, error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) {
      throw new AppError('Failed to update cart item', 500, 'UPDATE_ERROR');
    }

    res.json({
      success: true,
      data: updated,
      message: 'Cart item updated'
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { itemId } = req.params;

    // Verify ownership
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('user_id')
      .eq('id', itemId)
      .single();

    if (!cartItem || cartItem.user_id !== userId) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new AppError('Failed to remove item', 500, 'DELETE_ERROR');
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new AppError('Failed to clear cart', 500, 'DELETE_ERROR');
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const applyPromoCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError('Promo code required', 400, 'MISSING_CODE');
    }

    // In a real system, validate against promo codes table
    // For now, simple mock implementation
    const validCodes = {
      'KINBEN10': 10,  // 10% discount
      'KINBEN20': 20,  // 20% discount
      'WELCOME': 15    // 15% discount
    };

    const discount = validCodes[code.toUpperCase()];

    if (!discount) {
      throw new AppError('Invalid promo code', 400, 'INVALID_CODE');
    }

    res.json({
      success: true,
      data: {
        code: code.toUpperCase(),
        discountPercentage: discount,
        message: `${discount}% discount applied!`
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyPromoCode
};
