const UserTable = ({ users, onView }) => (
  <table className="w-full border">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2">Email</th>
        <th className="p-2">Name</th>
        <th className="p-2">Role</th>
        <th className="p-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td className="p-2">{user.email}</td>
          <td className="p-2">{user.first_name} {user.last_name}</td>
          <td className="p-2">{user.role}</td>
          <td className="p-2">
            <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => onView(user)}>View</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default UserTable;
