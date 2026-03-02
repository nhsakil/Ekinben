import React from 'react';

const PaymentForm = ({ data, onDataChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onDataChange({ ...data, [name]: value });
  };

  const handleCardNumberChange = (e) => {
    // Format card number with spaces every 4 digits
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    onDataChange({ ...data, cardNumber: value });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    onDataChange({ ...data, expiryDate: value });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

      {/* Payment Method Selection */}
      <div className="space-y-3 mb-8">
        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="method"
            value="card"
            checked={data.method === 'card'}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600"
          />
          <span className="ml-3 font-medium flex items-center">
            💳 Credit/Debit Card
          </span>
        </label>

        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="method"
            value="bkash"
            checked={data.method === 'bkash'}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600"
          />
          <span className="ml-3 font-medium">📱 bKash</span>
        </label>

        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="method"
            value="nagad"
            checked={data.method === 'nagad'}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600"
          />
          <span className="ml-3 font-medium">📞 Nagad</span>
        </label>

        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="method"
            value="cod"
            checked={data.method === 'cod'}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600"
          />
          <span className="ml-3 font-medium">🚚 Cash on Delivery</span>
        </label>
      </div>

      {/* Card Payment Form */}
      {data.method === 'card' && (
        <div className="card bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4">Card Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name *</label>
              <input
                type="text"
                name="cardName"
                value={data.cardName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
              <input
                type="text"
                value={data.cardNumber}
                onChange={handleCardNumberChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="4242 4242 4242 4242"
                maxLength="19"
                required
              />
              <p className="text-xs text-gray-500 mt-1">For testing: 4242 4242 4242 4242</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input
                  type="text"
                  value={data.expiryDate}
                  onChange={handleExpiryChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                <input
                  type="text"
                  name="cvv"
                  value={data.cvv}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="123"
                  maxLength="4"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              ⚠️ This is a demo. Card information is not actually processed.
            </p>
          </div>
        </div>
      )}

      {data.method === 'bkash' && (
        <div className="card bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">bKash Payment</h3>
          <p className="text-gray-600">You will be redirected to bKash gateway to complete the payment.</p>
        </div>
      )}

      {data.method === 'nagad' && (
        <div className="card bg-orange-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Nagad Payment</h3>
          <p className="text-gray-600">You will be redirected to Nagad gateway to complete the payment.</p>
        </div>
      )}

      {data.method === 'cod' && (
        <div className="card bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Cash on Delivery</h3>
          <p className="text-gray-600">Pay when your order arrives at your doorstep.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
