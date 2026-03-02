import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';

const CartSummary = ({ onCheckout }) => {
  const { subtotal, tax, total, discount, promoCode, applyPromoCode, isLoading } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoMessage('Please enter a promo code');
      return;
    }

    const success = await applyPromoCode(promoInput);
    if (success) {
      setPromoMessage('Promo code applied successfully!');
      setPromoInput('');
      setTimeout(() => setPromoMessage(''), 3000);
    } else {
      setPromoMessage('Invalid promo code');
      setTimeout(() => setPromoMessage(''), 3000);
    }
  };

  const discountAmount = discount > 0 ? (subtotal * discount / 100).toFixed(2) : 0;

  return (
    <div className="card bg-gray-50">
      <h2 className="text-xl font-bold mb-6">Order Summary</h2>

      {/* Promo Code Section */}
      <div className="mb-6 pb-6 border-b">
        <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || promoCode}
          />
          <button
            onClick={handleApplyPromo}
            disabled={isLoading || promoCode}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Apply
          </button>
        </div>
        {promoMessage && (
          <p className={`mt-2 text-sm ${promoMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {promoMessage}
          </p>
        )}
        {promoCode && (
          <p className="mt-2 text-sm text-green-600">✓ {promoCode} applied ({discount}% off)</p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span>৳{subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({discount}%)</span>
            <span>-৳{discountAmount}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-700">
          <span>Tax (15%)</span>
          <span>৳{tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-blue-600">৳{total.toFixed(2)}</span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Proceed to Checkout
      </button>

      {/* Continue Shopping Link */}
      <a
        href="/catalog"
        className="block text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
      >
        Continue Shopping
      </a>
    </div>
  );
};

export default CartSummary;
