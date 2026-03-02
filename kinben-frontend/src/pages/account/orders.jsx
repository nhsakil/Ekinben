import React from 'react';

const OrdersPage = () => {
  return (
    <div className="container-layout py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>

      <div className="card">
        <p className="text-gray-600 text-center py-12">
          You haven't placed any orders yet.
        </p>
      </div>
    </div>
  );
};

export default OrdersPage;
