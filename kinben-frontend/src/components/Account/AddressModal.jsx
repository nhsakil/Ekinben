import React, { useState } from 'react';
import axios from 'axios';
import AddressForm from './AddressForm';
import { toast } from 'react-toastify';

const AddressModal = ({ address, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('accessToken');

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (address?.id) {
        // Update existing address
        await axios.patch(
          `${apiUrl}/users/addresses/${address.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Address updated successfully');
      } else {
        // Create new address
        await axios.post(
          `${apiUrl}/users/addresses`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Address created successfully');
      }
      onSaved();
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to save address';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {address ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <AddressForm
            initialData={address}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
