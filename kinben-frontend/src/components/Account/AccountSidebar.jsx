import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AccountSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { label: 'Profile', path: '/account/profile', icon: '👤' },
    { label: 'Addresses', path: '/account/addresses', icon: '📍' },
    { label: 'Orders', path: '/account/orders', icon: '📦' },
    { label: 'Settings', path: '/account/settings', icon: '⚙️' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-full md:w-48 bg-white rounded-lg shadow">
      <nav className="flex flex-col md:block">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-3 border-b md:border-b flex items-center gap-3 transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 border-l-4 border-blue-600 font-semibold text-blue-600'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default AccountSidebar;
