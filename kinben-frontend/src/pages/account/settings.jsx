import React, { useState } from 'react';
import AccountSidebar from '../../components/Account/AccountSidebar';

const SettingsPage = () => {
  const [preferences, setPreferences] = useState({
    orderStatusEmail: true,
    promotionalEmail: false,
    newslLetterSubscription: true,
    twoFactorAuth: false
  });

  const handleToggle = (field) => {
    setPreferences({
      ...preferences,
      [field]: !preferences[field]
    });
  };

  const renderToggleSwitch = (checked, onChange) => (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`block w-12 h-6 rounded-full transition-colors ${
            checked ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            checked ? 'translate-x-6' : ''
          }`}
        ></div>
      </div>
    </label>
  );

  return (
    <div className="container-layout py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <AccountSidebar />

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Email Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Email Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Order Status Updates</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive emails about order confirmations, shipments, and delivery
                  </p>
                </div>
                {renderToggleSwitch(
                  preferences.orderStatusEmail,
                  () => handleToggle('orderStatusEmail')
                )}
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Promotional Offers</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Get notified about special discounts and exclusive deals
                  </p>
                </div>
                {renderToggleSwitch(
                  preferences.promotionalEmail,
                  () => handleToggle('promotionalEmail')
                )}
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Newsletter</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Subscribe to our newsletter for styling tips and new arrivals
                  </p>
                </div>
                {renderToggleSwitch(
                  preferences.newslLetterSubscription,
                  () => handleToggle('newslLetterSubscription')
                )}
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Privacy & Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                {renderToggleSwitch(
                  preferences.twoFactorAuth,
                  () => handleToggle('twoFactorAuth')
                )}
              </div>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">View Privacy Policy</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Read our privacy policy and data collection practices
                    </p>
                  </div>
                  <span className="text-lg">→</span>
                </div>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">View Terms of Service</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Review our terms and conditions
                    </p>
                  </div>
                  <span className="text-lg">→</span>
                </div>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-700 mb-4">Danger Zone</h2>
            <div className="space-y-3">
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
                Logout All Sessions
              </button>
              <button className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium">
                Delete Account Permanently
              </button>
              <p className="text-sm text-red-600">
                ⚠️ These actions cannot be undone. Please be careful.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>💡 Note:</strong> Your preferences are saved automatically. Changes take effect immediately for email subscriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
