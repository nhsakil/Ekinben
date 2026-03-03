import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountSidebar from '../../components/Account/AccountSidebar';
import AddressCard from '../../components/Account/AddressCard';
import AddressModal from '../../components/Account/AddressModal';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import AddressForm from '../../components/Account/AddressForm';

const AddressesPage = () => {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axios.get('/api/users/addresses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(res.data.data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [token]);

  const handleAdd = () => {
    setEditAddress(null);
    setShowModal(true);
  };

  const handleEdit = (address) => {
    setEditAddress(address);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/users/addresses/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSave = async (address) => {
    if (address.id) {
      // Edit
      const res = await axios.patch(`/api/users/addresses/${address.id}`, address, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addresses.map(addr => addr.id === address.id ? res.data.data : addr));
    } else {
      // Add
      const res = await axios.post('/api/users/addresses', address, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses([...addresses, res.data.data]);
    }
    setShowModal(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Addresses</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Add Address</button>
      <div className="space-y-4">
        {addresses.map(addr => (
          <AddressCard key={addr.id} address={addr} onEdit={() => handleEdit(addr)} onDelete={() => handleDelete(addr.id)} />
        ))}
      </div>
      {showModal && (
        <AddressModal
          address={editAddress}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AddressesPage;
