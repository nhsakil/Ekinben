import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import AccountSidebar from '../../components/Account/AccountSidebar';
import ProfileForm from '../../components/Account/ProfileForm';
import ChangePasswordForm from '../../components/Account/ChangePasswordForm';
import ProfilePictureUpload from '../../components/Account/ProfilePictureUpload';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${apiUrl}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data.data);
        setNewsletter(response.data.data.newsletter_subscribed || false);
      } catch (error) {
        toast.error('Failed to load profile');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [apiUrl, token]);

  const handleToggleNewsletter = async () => {
    try {
      const response = await axios.patch(
        `${apiUrl}/users/newsletter`,
        { subscribed: !newsletter },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewsletter(response.data.data.subscribed);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update newsletter preference');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="container-layout py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-layout py-12">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-layout py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600 mt-2">Manage your profile and account settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <AccountSidebar />

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
            <ProfilePictureUpload
              currentImage={profile.profile_image_url}
              onUpload={(imageUrl) => {
                setProfile({ ...profile, profile_image_url: imageUrl });
                toast.success('Profile picture updated');
              }}
            />
          </div>

          {/* Profile Information Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <ProfileForm
                profile={profile}
                onSave={(updatedProfile) => {
                  setProfile(updatedProfile);
                  setIsEditing(false);
                  toast.success('Profile updated successfully');
                }}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">First Name</p>
                    <p className="text-lg font-medium">{profile.first_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Name</p>
                    <p className="text-lg font-medium">{profile.last_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg font-medium">{profile.phone_number || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="text-lg font-medium">{profile.date_of_birth || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="text-lg font-medium">{profile.gender || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Security</h2>

            </div>

            {showPasswordForm ? (
              <ChangePasswordForm
                onSuccess={() => {
                  setShowPasswordForm(false);
                  toast.success('Password changed successfully');
                }}
                onCancel={() => setShowPasswordForm(false)}
              />
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Password must be changed periodically for security</p>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Change Password
                </button>
              </div>
            )}
          </div>

          {/* Newsletter Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Preferences</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Newsletter Subscription</p>
                <p className="text-sm text-gray-600 mt-1">
                  {newsletter
                    ? 'You are subscribed to our newsletter'
                    : 'You are not subscribed to our newsletter'}
                </p>
              </div>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={handleToggleNewsletter}
                    className="sr-only"
                  />
                  <div
                    className={`block w-12 h-6 rounded-full transition-colors ${
                      newsletter ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      newsletter ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </label>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Account created:</strong> {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
