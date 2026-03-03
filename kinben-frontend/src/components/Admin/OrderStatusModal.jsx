const OrderStatusModal = ({ order, onUpdate, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full relative">
      <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>×</button>
      <h3 className="text-xl font-bold mb-4">Update Status for Order #{order.orderNumber}</h3>
      <select className="border p-2 w-full mb-4" defaultValue={order.status}>
        <option value="pending">Pending</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => onUpdate(order)}>Update</button>
    </div>
  </div>
);

export default OrderStatusModal;
