import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="container-layout py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="max-w-2xl">
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Account Information</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">First Name</label>
                <p className="font-medium">{user?.first_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Last Name</label>
                <p className="font-medium">{user?.last_name || 'Not set'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="font-medium">{user?.phone_number || 'Not set'}</p>
            </div>

            <button className="btn-primary mt-6">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
