import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, orderNumber } = location.state || {};

  useEffect(() => {
    // Redirect if no order data
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="container-layout py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg">Thank you for your purchase</p>
        </div>

        {/* Order Card */}
        <div className="card">
          <div className="border-b pb-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-mono font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">৳{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Pending Confirmation</span>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-bold mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>{item.product_name} x {item.quantity}</span>
                  <span className="font-medium">৳{(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Your order has been received</li>
              <li>⏳ You will receive a confirmation email shortly</li>
              <li>📦 Track your order status in your account</li>
              <li>🚚 Expect delivery within 3-5 business days</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4 flex-col sm:flex-row">
            <a
              href="/account/orders"
              className="btn-primary flex-1 text-center"
            >
              View My Orders
            </a>
            <a
              href="/catalog"
              className="btn-outline flex-1 text-center"
            >
              Continue Shopping
            </a>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need help with your order?</p>
          <div className="space-y-2">
            <p className="text-sm"><strong>Email:</strong> kinbenclothing@gmail.com</p>
            <p className="text-sm"><strong>Phone:</strong> +8809611900372</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
