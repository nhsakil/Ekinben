const UserDetailModal = ({ user, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full relative">
      <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>×</button>
      <h3 className="text-xl font-bold mb-4">User Details</h3>
      <div>Email: {user.email}</div>
      <div>Name: {user.first_name} {user.last_name}</div>
      <div>Role: {user.role}</div>
      {/* Add more user details as needed */}
    </div>
  </div>
);

export default UserDetailModal;
