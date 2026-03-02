import React from 'react';

const CatalogPage = () => {
  return (
    <div className="container-layout py-8">
      <h1 className="text-3xl font-bold mb-8">Our Collection</h1>
      <p className="text-gray-600 mb-6">Browse our premium collection of men's fashion.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="card hover:shadow-lg transition-shadow">
            <div className="bg-gray-300 h-48 rounded mb-4"></div>
            <h3 className="font-semibold mb-2">Product {i}</h3>
            <p className="text-gray-600 text-sm mb-2">Classic Design</p>
            <p className="text-gray-900 font-bold mb-4">৳1,690 - ৳2,490</p>
            <button className="btn-primary w-full text-sm">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;
