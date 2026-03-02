import React from 'react';

const AddressCard = ({ address, onEdit, onDelete }) => {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{address.label}</h3>
          <p className="text-sm text-gray-600">
            {address.first_name} {address.last_name}
          </p>
        </div>
        <div className="flex gap-2">
          {address.is_default_shipping && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
              📦 Shipping
            </span>
          )}
          {address.is_default_billing && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
              💳 Billing
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-4 text-sm text-gray-600">
        <p>{address.street_address}</p>
        {address.apartment_suite && <p>{address.apartment_suite}</p>}
        <p>
          {address.city}, {address.state_province} {address.postal_code}
        </p>
        <p>{address.country}</p>
        <p className="mt-2">📞 {address.phone_number}</p>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={onEdit}
          className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition-colors font-medium text-sm"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition-colors font-medium text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
