import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState(null);
  const [discount, setDiscount] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('accessToken');

  // Fetch cart on mount
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  // Recalculate totals when items change
  useEffect(() => {
    calculateTotals();
  }, [items, discount]);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data.data.items);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch cart');
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl]);

  const calculateTotals = () => {
    let newSubtotal = 0;
    items.forEach(item => {
      const price = item.product_variants?.price || item.products?.price || 0;
      newSubtotal += price * item.quantity;
    });

    const discountAmount = newSubtotal * (discount / 100);
    const newSubtotalAfterDiscount = newSubtotal - discountAmount;
    const newTax = parseFloat((newSubtotalAfterDiscount * 0.15).toFixed(2));
    const newTotal = parseFloat((newSubtotalAfterDiscount + newTax).toFixed(2));

    setSubtotal(parseFloat(newSubtotal.toFixed(2)));
    setTax(newTax);
    setTotal(newTotal);
  };

  const addToCart = useCallback(async (productId, productVariantId = null, quantity = 1) => {
    if (!token) {
      setError('Please login to add items to cart');
      return false;
    }

    try {
      setIsLoading(true);
      await axios.post(
        `${apiUrl}/cart/items`,
        { productId, productVariantId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add item');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl, fetchCart]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return false;

    try {
      setIsLoading(true);
      await axios.patch(
        `${apiUrl}/cart/items/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update quantity');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl, fetchCart]);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      setIsLoading(true);
      await axios.delete(
        `${apiUrl}/cart/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to remove item');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl, fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      await axios.delete(
        `${apiUrl}/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems([]);
      setDiscount(0);
      setPromoCode(null);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to clear cart');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl]);

  const applyPromoCode = useCallback(async (code) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${apiUrl}/cart/promo-code`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPromoCode(code);
      setDiscount(response.data.data.discountPercentage);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid promo code');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl]);

  const value = {
    items,
    subtotal,
    tax,
    total,
    discount,
    promoCode,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
    fetchCart,
    itemCount: items.length
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
