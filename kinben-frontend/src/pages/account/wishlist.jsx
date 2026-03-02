import React from 'react';

const WishlistPage = () => {
  return (
    <div className="container-layout py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      <div className="card">
        <p className="text-gray-600 text-center py-12">
          You haven't added anything to your wishlist yet.
        </p>
      </div>
    </div>
  );
};

export default WishlistPage;
