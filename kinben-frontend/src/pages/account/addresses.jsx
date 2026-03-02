import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountSidebar from '../../components/Account/AccountSidebar';
import AddressCard from '../../components/Account/AddressCard';
import AddressModal from '../../components/Account/AddressModal';
import { toast } from 'react-toastify';

const AddressBookPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('accessToken');

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${apiUrl}/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data.data);
    } catch (error) {
      toast.error('Failed to load addresses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [apiUrl, token]);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await axios.delete(`${apiUrl}/users/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addresses.filter(a => a.id !== addressId));
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete address');
      console.error(error);
    }
  };

  const handleAddressSaved = () => {
    setShowAddressModal(false);
    fetchAddresses();
  };

  if (loading) {
    return (
      <div className="container-layout py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-layout py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600 mt-2">Manage your addresses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <AccountSidebar />

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Saved Addresses</h2>
              <button
                onClick={handleAddAddress}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't saved any addresses yet</p>
                <button
                  onClick={handleAddAddress}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(address => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={() => handleEditAddress(address)}
                    onDelete={() => handleDeleteAddress(address.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <AddressModal
          address={editingAddress}
          onClose={() => setShowAddressModal(false)}
          onSaved={handleAddressSaved}
        />
      )}
    </div>
  );
};

export default AddressBookPage;
