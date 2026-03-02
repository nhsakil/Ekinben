import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="container-layout py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="bg-gray-300 h-96 rounded-lg"></div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Premium Product</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-400">★★★★★</span>
            <span className="text-sm text-gray-600">(10 reviews)</span>
          </div>

          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-3xl font-bold text-gray-900">৳1,690</span>
            <span className="text-lg line-through text-gray-500">৳1,990</span>
          </div>

          <p className="text-gray-600 mb-6">
            High-quality premium product with excellent stitching and comfort. Perfect for casual and formal wear.
          </p>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block font-semibold mb-3">Size</label>
            <div className="flex gap-3">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block font-semibold mb-3">Color</label>
            <div className="flex gap-3">
              {['White', 'Black', 'Navy', 'Maroon'].map((color) => (
                <button
                  key={color}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button className="flex-1 btn-primary">Add to Cart</button>
            <button className="px-6 btn-outline">♡ Wishlist</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
