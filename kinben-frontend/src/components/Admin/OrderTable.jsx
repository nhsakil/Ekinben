const OrderTable = ({ orders, onStatus }) => (
  <table className="w-full border">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2">Order #</th>
        <th className="p-2">Status</th>
        <th className="p-2">Total</th>
        <th className="p-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {orders.map(order => (
        <tr key={order.id}>
          <td className="p-2">{order.orderNumber}</td>
          <td className="p-2">{order.status}</td>
          <td className="p-2">৳{order.total}</td>
          <td className="p-2">
            <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => onStatus(order)}>Update Status</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default OrderTable;
