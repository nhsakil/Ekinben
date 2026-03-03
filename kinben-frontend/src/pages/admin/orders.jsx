import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import OrderTable from '../../components/Admin/OrderTable';
import OrderStatusModal from '../../components/Admin/OrderStatusModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/orders');
        setOrders(res.data.data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatus = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (order) => {
    // Example: update status to 'shipped' (can be dynamic)
    const res = await axios.patch(`/api/orders/${order.id}`, {
      status: order.status || 'shipped',
      trackingNumber: order.trackingNumber || ''
    });
    setOrders(orders.map(o => o.id === order.id ? res.data.data : o));
    setShowStatusModal(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>
        <OrderTable orders={orders} onStatus={handleStatus} />
        {showStatusModal && selectedOrder && (
          <OrderStatusModal
            order={selectedOrder}
            onUpdate={handleUpdateStatus}
            onClose={() => setShowStatusModal(false)}
          />
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
