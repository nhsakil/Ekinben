import AdminSidebar from '../../components/Admin/AdminSidebar';

const AdminDashboard = () => (
  <div className="flex min-h-screen">
    <AdminSidebar />
    <main className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <p>Manage all products in the catalog.</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p>View and update all orders.</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p>Manage user accounts and access.</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p>View sales and user analytics.</p>
        </div>
      </div>
    </main>
  </div>
);

export default AdminDashboard;
