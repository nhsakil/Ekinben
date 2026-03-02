import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

const ProductCard = ({ product, showAddToCart = true }) => {
  const { addToCart, isLoading } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  const imageUrl = primaryImage?.image_url || '/images/placeholder.png';
  const discountPercent = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAddingToCart(true);
    const success = await addToCart(product.id);
    setAddingToCart(false);

    if (success) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group block hover:shadow-lg transition-shadow duration-300">
      <div className="card p-0 overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative bg-gray-100 aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Badge */}
          {product.is_featured && (
            <div className="absolute top-3 left-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">
              Featured
            </div>
          )}

          {discountPercent > 0 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              -{discountPercent}%
            </div>
          )}

          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <p className="text-white font-bold text-center">Out of Stock</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            {product.categories?.name || 'Uncategorized'}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.average_rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600">
                {product.average_rating.toFixed(1)} ({product.total_reviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4 mt-auto">
            <span className="text-lg font-bold text-gray-900">৳{product.price.toFixed(2)}</span>
            {product.compare_price && (
              <span className="text-sm line-through text-gray-500">
                ৳{product.compare_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || addingToCart || isLoading}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                addSuccess
                  ? 'bg-green-500 text-white'
                  : product.stock_quantity === 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {addSuccess ? '✓ Added to Cart' : addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
