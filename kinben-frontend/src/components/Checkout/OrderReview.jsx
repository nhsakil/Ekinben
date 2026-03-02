import React from 'react';

const OrderReview = ({
  items,
  shippingData,
  billingData,
  paymentMethod,
  subtotal,
  tax,
  total,
  discount
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

      {/* Items */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="font-semibold mb-4">Order Items</h3>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{item.products.name}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity} × ৳{(item.product_variants?.price || item.products.price).toFixed(2)}
                </p>
              </div>
              <p className="font-semibold">৳{((item.product_variants?.price || item.products.price) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="font-semibold mb-3">Shipping Address</h3>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="font-medium">
            {shippingData.firstName} {shippingData.lastName}
          </p>
          <p className="text-gray-600">{shippingData.streetAddress}</p>
          {shippingData.apartmentSuite && (
            <p className="text-gray-600">{shippingData.apartmentSuite}</p>
          )}
          <p className="text-gray-600">
            {shippingData.city}, {shippingData.stateProvince} {shippingData.postalCode}
          </p>
          <p className="text-gray-600">{shippingData.country}</p>
          <p className="text-gray-600 mt-2">Phone: {shippingData.phoneNumber}</p>
        </div>
      </div>

      {/* Billing Address */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="font-semibold mb-3">Billing Address</h3>
        {billingData.isSameAsShipping ? (
          <p className="text-gray-600 italic">Same as shipping address</p>
        ) : (
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="font-medium">
              {billingData.firstName} {billingData.lastName}
            </p>
            <p className="text-gray-600">{billingData.streetAddress}</p>
            {billingData.apartmentSuite && (
              <p className="text-gray-600">{billingData.apartmentSuite}</p>
            )}
            <p className="text-gray-600">
              {billingData.city}, {billingData.stateProvince} {billingData.postalCode}
            </p>
            <p className="text-gray-600">{billingData.country}</p>
            <p className="text-gray-600 mt-2">Phone: {billingData.phoneNumber}</p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="font-semibold mb-3">Payment Method</h3>
        <div className="p-4 bg-purple-50 rounded-lg">
          {paymentMethod === 'card' && '💳 Credit/Debit Card'}
          {paymentMethod === 'bkash' && '📱 bKash'}
          {paymentMethod === 'nagad' && '📞 Nagad'}
          {paymentMethod === 'cod' && '🚚 Cash on Delivery'}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-4">Price Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>৳{subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({discount}%)</span>
              <span>-৳{((subtotal * discount / 100).toFixed(2))}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Tax (15%)</span>
            <span>৳{tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>৳100</span>
          </div>

          <div className="border-t pt-2 mt-2 flex justify-between items-center text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-blue-600">৳{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700">
          ✓ Please review all information above. Click "Place Order" to complete your purchase.
        </p>
      </div>
    </div>
  );
};

export default OrderReview;
