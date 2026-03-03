import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Share2, Heart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import StarRating from '../../components/Products/StarRating';
import ReviewForm from '../../components/Products/ReviewForm';
import ReviewList from '../../components/Products/ReviewList';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
          setSelectedColor(data.data.color || '');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${id}`);
        const data = await response.json();
        if (data.success) {
          setReviews(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-96 rounded-lg animate-pulse" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Product Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Images */}
            <div>
              <div className="bg-gray-200 aspect-square rounded-lg mb-4 flex items-center justify-center text-gray-400">
                Product Image
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 aspect-square rounded-lg text-gray-400 flex items-center justify-center text-xs">
                    Img
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <StarRating rating={product.average_rating || 0} />
                <span className="text-sm text-gray-600">
                  ({product.total_reviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">৳{product.price}</span>
                {product.compare_price && (
                  <span className="text-lg line-through text-gray-500">৳{product.compare_price}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600 font-medium">In Stock • {product.stock_quantity} available</span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </p>
              </div>

              {/* Options */}
              {product.color && (
                <div className="mb-6">
                  <label className="block font-semibold text-gray-900 mb-3 text-sm uppercase">
                    Color: {selectedColor}
                  </label>
                  <div className="flex gap-3">
                    {[product.color, 'White', 'Black', 'Navy'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${
                          selectedColor === color
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-900 mb-3 text-sm uppercase">
                  Size: {selectedSize}
                </label>
                <div className="flex gap-3">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${
                        selectedSize === size
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-900 mb-3 text-sm uppercase">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 border-l border-r border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => setWishlist(!wishlist)}
                  className={`px-6 py-3 border rounded-lg transition-colors ${
                    wishlist
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlist ? 'fill-current' : ''}`} />
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:border-gray-400 text-gray-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Meta */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>SKU: {product.sku}</p>
                <p>Category: {product.categories?.name || 'Uncategorized'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            {user && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Write a Review
              </button>
            )}
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Sign in to Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                productId={product.id}
                onReviewSubmitted={() => {
                  setShowReviewForm(false);
                  // Refetch reviews
                  const fetchReviews = async () => {
                    try {
                      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${id}`);
                      const data = await response.json();
                      if (data.success) {
                        setReviews(data.data || []);
                      }
                    } catch (error) {
                      console.error('Failed to fetch reviews:', error);
                    }
                  };
                  fetchReviews();
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          <ReviewList
            productId={product.id}
            reviews={reviews}
            isLoading={reviewsLoading}
            onDeleteReview={handleDeleteReview}
            currentUserId={user?.id}
          />
        </div>
      </div>
    </div>
  );
}
