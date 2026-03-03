import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountSidebar from '../../components/Account/AccountSidebar';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${apiUrl}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 }
        });
        setOrders(response.data.data || []);
      } catch (error) {
        toast.error('Failed to load orders');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [apiUrl, token]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✓',
      shipped: '📦',
      delivered: '🎉',
      cancelled: '✗'
    };
    return icons[status] || '❓';
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const handleViewDetails = async (orderId) => {
    try {
      const res = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrder(res.data.data);
    } catch (err) {
      // handle error
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="container-layout py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-layout py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600 mt-2">View and track your orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <AccountSidebar />

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">My Orders</h2>
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  {orders.length === 0
                    ? 'You haven\'t placed any orders yet'
                    : `No ${filter} orders`}
                </p>
                <a
                  href="/catalog"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Start Shopping
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{order.order_number}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Order Date</p>
                            <p className="font-medium">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Items</p>
                            <p className="font-medium">
                              {order.order_items?.length || 0} item(s)
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Shipping Method</p>
                            <p className="font-medium capitalize">
                              {order.shipping_method || 'Standard'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-bold text-blue-600">
                              ৳{order.total?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>

                        {order.tracking_number && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              📦 Tracking: <span className="font-mono font-semibold">{order.tracking_number}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm whitespace-nowrap" onClick={() => handleViewDetails(order.id)}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={handleCloseDetails}>×</button>
            <h3 className="text-xl font-bold mb-2">Order #{selectedOrder.orderNumber}</h3>
            <div>Status: {selectedOrder.status}</div>
            <div>Total: ৳{selectedOrder.total}</div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Items</h4>
              <ul className="list-disc ml-5">
                {selectedOrder.items.map(item => (
                  <li key={item.id}>{item.name} x {item.quantity} (৳{item.price})</li>
                ))}
              </ul>
            </div>
            {/* Add more details as needed (shipping, billing, etc.) */}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
