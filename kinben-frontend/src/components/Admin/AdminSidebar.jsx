import { Link } from 'react-router-dom';

const AdminSidebar = () => (
  <aside className="w-64 h-full bg-gray-900 text-white p-6 flex flex-col space-y-4">
    <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
    <nav className="flex flex-col space-y-2">
      <Link to="/admin/dashboard" className="hover:bg-gray-800 rounded px-3 py-2">Overview</Link>
      <Link to="/admin/products" className="hover:bg-gray-800 rounded px-3 py-2">Products</Link>
      <Link to="/admin/orders" className="hover:bg-gray-800 rounded px-3 py-2">Orders</Link>
      <Link to="/admin/users" className="hover:bg-gray-800 rounded px-3 py-2">Users</Link>
      <Link to="/admin/analytics" className="hover:bg-gray-800 rounded px-3 py-2">Analytics</Link>
    </nav>
  </aside>
);

export default AdminSidebar;
