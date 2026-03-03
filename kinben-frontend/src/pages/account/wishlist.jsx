import React from 'react';
import WishlistItem from '../../components/Wishlist/WishlistItem';

const WishlistPage = () => (
  <div className="container-layout py-8">
    <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
    <WishlistItem />
  </div>
);

export default WishlistPage;
