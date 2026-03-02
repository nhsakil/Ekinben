import React from 'react';

const ShippingForm = ({ data, addresses, onDataChange, selectedAddressId, onSelectAddress }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onDataChange({ ...data, [name]: value });
  };

  const handleSelectAddress = (address) => {
    onSelectAddress(address.id);
    onDataChange({
      firstName: address.first_name,
      lastName: address.last_name,
      phoneNumber: address.phone_number,
      streetAddress: address.street_address,
      apartmentSuite: address.apartment_suite,
      city: address.city,
      stateProvince: address.state_province,
      postalCode: address.postal_code,
      country: address.country,
      label: address.label,
      addressId: address.id
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>

      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="mb-8 pb-6 border-b">
          <h3 className="font-semibold mb-4">Select Saved Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(address => (
              <button
                key={address.id}
                onClick={() => handleSelectAddress(address)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedAddressId === address.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold">{address.label}</p>
                <p className="text-sm text-gray-600">{address.street_address}</p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state_province} {address.postal_code}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Address Form */}
      <div>
        <h3 className="font-semibold mb-4">{selectedAddressId ? 'Or enter a new address' : 'Enter Shipping Address'}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={data.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={data.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={data.phoneNumber}
              onChange={handleChange}
              placeholder="01700000000"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              name="streetAddress"
              value={data.streetAddress}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, Suite (optional)</label>
            <input
              type="text"
              name="apartmentSuite"
              value={data.apartmentSuite}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              name="city"
              value={data.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
            <input
              type="text"
              name="stateProvince"
              value={data.stateProvince}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
            <input
              type="text"
              name="postalCode"
              value={data.postalCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input
              type="text"
              name="country"
              value={data.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Shipping Method */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-4">Shipping Method</h3>
          <div className="space-y-3">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="shipping" value="standard" defaultChecked className="mr-3" />
              <div>
                <div className="font-medium">Standard Delivery</div>
                <div className="text-sm text-gray-600">3-5 business days - ৳100</div>
              </div>
            </label>
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="shipping" value="express" className="mr-3" />
              <div>
                <div className="font-medium">Express Delivery</div>
                <div className="text-sm text-gray-600">1-2 business days - ৳200</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
