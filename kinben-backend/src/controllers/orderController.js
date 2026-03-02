import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateOrderNumber, calculateOrderTotal, getPaginationParams } from '../utils/helpers.js';
import { validateOrderData } from '../utils/validators.js';

export const createOrder = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const {
      items,
      shippingAddressId,
      billingAddressId,
      shippingMethod,
      paymentMethod,
      promoCode,
      customerNotes
    } = req.body;

    // Validate order data
    const validation = validateOrderData({ items, shipping_address_id: shippingAddressId, payment_method: paymentMethod });
    if (!validation.isValid) {
      throw new AppError(validation.errors.join(', '), 400, 'VALIDATION_ERROR');
    }

    // Verify addresses belong to user
    if (shippingAddressId) {
      const { data: shippingAddr } = await supabase
        .from('addresses')
        .select('id')
        .eq('id', shippingAddressId)
        .eq('user_id', userId)
        .single();

      if (!shippingAddr) {
        throw new AppError('Shipping address not found', 404, 'NOT_FOUND');
      }
    }

    if (billingAddressId) {
      const { data: billingAddr } = await supabase
        .from('addresses')
        .select('id')
        .eq('id', billingAddressId)
        .eq('user_id', userId)
        .single();

      if (!billingAddr) {
        throw new AppError('Billing address not found', 404, 'NOT_FOUND');
      }
    }

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('email, phone_number')
      .eq('id', userId)
      .single();

    // Fetch cart items with product details
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('product_id, product_variant_id, quantity, products(name, sku, price, stock_quantity), product_variants(price)')
      .eq('user_id', userId);

    if (!cartItems || cartItems.length === 0) {
      throw new AppError('Cart is empty', 400, 'EMPTY_CART');
    }

    // Validate stock for all items
    for (const item of cartItems) {
      if (item.products.stock_quantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${item.products.name}`,
          400,
          'OUT_OF_STOCK'
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const unitPrice = item.product_variants?.price || item.products.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        product_name: item.products.name,
        product_sku: item.products.sku,
        unit_price: unitPrice,
        quantity: item.quantity,
        subtotal: itemTotal
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode) {
      const validCodes = { 'KINBEN10': 10, 'KINBEN20': 20, 'WELCOME': 15 };
      const discountPercent = validCodes[promoCode.toUpperCase()];
      if (discountPercent) {
        discountAmount = parseFloat((subtotal * discountPercent / 100).toFixed(2));
      }
    }

    // Calculate tax (15%)
    const taxAmount = parseFloat(((subtotal - discountAmount) * 0.15).toFixed(2));

    // Shipping cost (mock - real would vary by method)
    const shippingCost = shippingMethod === 'express' ? 200 : 100;

    // Total
    const totalAmount = calculateOrderTotal(subtotal, taxAmount, shippingCost, discountAmount);

    // Create order
    const orderNumber = generateOrderNumber();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        user_id: userId,
        email: user.email,
        phone_number: user.phone_number,
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId,
        subtotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        promo_code: promoCode,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        customer_notes: customerNotes,
        order_status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) {
      throw new AppError('Failed to create order', 500, 'CREATE_ERROR');
    }

    // Add order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      throw new AppError('Failed to add items to order', 500, 'CREATE_ERROR');
    }

    // Update product stock
    for (const item of cartItems) {
      await supabase
        .from('products')
        .update({ stock_quantity: item.products.stock_quantity - item.quantity })
        .eq('id', item.product_id);
    }

    // Clear user's cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    // Create payment log
    await supabase
      .from('payment_logs')
      .insert([{
        order_id: order.id,
        payment_method: paymentMethod,
        amount: totalAmount,
        status: 'pending',
        response_data: { mockPaymentId: `PAY-${order.id}` }
      }]);

    res.status(201).json({
      success: true,
      data: {
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.order_status,
          total: order.total_amount,
          items: orderItems,
          shipping: shippingCost
        },
        clientSecret: `mock_${order.id}` // Mock payment intent
      },
      message: 'Order created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { page, limit, offset } = getPaginationParams(req.query);
    const { status } = req.query;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(name, slug))', { count: 'exact' })
      .eq('user_id', userId);

    if (status) {
      query = query.eq('order_status', status);
    }

    const { data: orders, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError('Failed to fetch orders', 500, 'FETCH_ERROR');
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: orders,
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

export const getOrderById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, slug, price)), addresses(*), payment_logs(*)')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error || !order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { orderId } = req.params;

    // Verify ownership
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_status, user_id, order_items(product_id, quantity)')
      .eq('id', orderId)
      .single();

    if (!order || order.user_id !== userId) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    if (order.order_status !== 'pending') {
      throw new AppError('Can only cancel pending orders', 400, 'INVALID_STATE');
    }

    // Restore stock
    for (const item of order.order_items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ stock_quantity: product.stock_quantity + item.quantity })
          .eq('id', item.product_id);
      }
    }

    // Update order status
    const { data: updated, error } = await supabase
      .from('orders')
      .update({ order_status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to cancel order', 500, 'UPDATE_ERROR');
    }

    res.json({
      success: true,
      data: updated,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const validStates = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStates.includes(status)) {
      throw new AppError('Invalid order status', 400, 'INVALID_STATUS');
    }

    const updateData = {
      order_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'shipped' && trackingNumber) {
      updateData.tracking_number = trackingNumber;
      updateData.shipped_at = new Date().toISOString();
    }

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error || !order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: order,
      message: 'Order status updated'
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { status, startDate, endDate } = req.query;

    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' });

    if (status) {
      query = query.eq('order_status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: orders, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError('Failed to fetch orders', 500, 'FETCH_ERROR');
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: orders,
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

export default {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders
};
