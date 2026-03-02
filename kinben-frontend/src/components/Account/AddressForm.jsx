import React, { useState } from 'react';

const AddressForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    label: initialData?.label || 'Home',
    firstName: initialData?.first_name || '',
    lastName: initialData?.last_name || '',
    phoneNumber: initialData?.phone_number || '',
    streetAddress: initialData?.street_address || '',
    apartmentSuite: initialData?.apartment_suite || '',
    city: initialData?.city || '',
    stateProvince: initialData?.state_province || '',
    postalCode: initialData?.postal_code || '',
    country: initialData?.country || 'Bangladesh',
    isDefaultShipping: initialData?.is_default_shipping || false,
    isDefaultBilling: initialData?.is_default_billing || false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(?:\+880|0)1[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid Bangladesh phone number';
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Address Label</label>
        <select
          name="label"
          value={formData.label}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option>Home</option>
          <option>Work</option>
          <option>Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.firstName ? 'border-red-500' : ''
            }`}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.lastName ? 'border-red-500' : ''
            }`}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone Number *</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="01700000000"
          className={`w-full px-3 py-2 border rounded-lg text-sm ${
            errors.phoneNumber ? 'border-red-500' : ''
          }`}
        />
        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Street Address *</label>
        <input
          type="text"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm ${
            errors.streetAddress ? 'border-red-500' : ''
          }`}
        />
        {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Apartment, Suite (optional)</label>
        <input
          type="text"
          name="apartmentSuite"
          value={formData.apartmentSuite}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.city ? 'border-red-500' : ''
            }`}
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">State/Province</label>
          <input
            type="text"
            name="stateProvince"
            value={formData.stateProvince}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Postal Code *</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.postalCode ? 'border-red-500' : ''
            }`}
          />
          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country *</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.country ? 'border-red-500' : ''
            }`}
          />
          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isDefaultShipping"
            checked={formData.isDefaultShipping}
            onChange={handleChange}
            className="w-4 h-4 rounded"
          />
          <span className="ml-2 text-sm">Set as default shipping address</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            name="isDefaultBilling"
            checked={formData.isDefaultBilling}
            onChange={handleChange}
            className="w-4 h-4 rounded"
          />
          <span className="ml-2 text-sm">Set as default billing address</span>
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isLoading ? 'Saving...' : 'Save Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
