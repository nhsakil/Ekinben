import React from 'react';
import { useCart } from '../../hooks/useCart';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const price = item.product_variants?.price || item.products?.price || 0;
  const image = item.products?.product_images?.find(img => img.is_primary)?.image_url || '/images/placeholder.png';

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
        <img src={image} alt={item.products?.name} className="w-full h-full object-cover rounded-lg" />
      </div>

      {/* Product Info */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900">{item.products?.name}</h3>
        {item.product_variants && (
          <p className="text-sm text-gray-600">
            {item.product_variants.variant_type}: {item.product_variants.variant_value}
          </p>
        )}
        <p className="text-sm font-medium text-gray-700 mt-1">৳{price.toFixed(2)}</p>
      </div>

      {/* Quantity Control */}
      <div className="flex items-center border rounded-lg">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
        >
          −
        </button>
        <span className="px-4 py-1 text-center min-w-12">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-20">
        <p className="font-semibold text-gray-900">৳{(price * item.quantity).toFixed(2)}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="ml-4 text-red-500 hover:text-red-700 font-medium text-sm"
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;
