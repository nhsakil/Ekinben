import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import UserTable from '../../components/Admin/UserTable';
import UserDetailModal from '../../components/Admin/UserDetailModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data.data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleView = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <UserTable users={users} onView={handleView} />
        {showDetailModal && selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
