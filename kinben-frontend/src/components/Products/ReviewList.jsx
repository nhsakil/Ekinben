import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewList({ productId, reviews = [], isLoading = false, onDeleteReview, currentUserId }) {
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState(0);

  // Filter and sort reviews
  let filteredReviews = [...reviews];
  if (filterRating > 0) {
    filteredReviews = filteredReviews.filter(r => r.rating === filterRating);
  }

  if (sortBy === 'helpful') {
    filteredReviews.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
  } else if (sortBy === 'rating') {
    filteredReviews.sort((a, b) => b.rating - a.rating);
  } else {
    filteredReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-lg p-4 h-32" />
        ))}
      </div>
    );
  }

  if (filteredReviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-sm text-gray-600 mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="newest">Newest</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 mr-2">Filter by rating:</label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value={0}>All</option>
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <StarRating rating={review.rating} size="sm" />
                {review.title && (
                  <h4 className="font-semibold text-gray-900 mt-1">{review.title}</h4>
                )}
              </div>
              {currentUserId === review.user_id && (
                <button
                  onClick={() => onDeleteReview?.(review.id)}
                  className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Metadata */}
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">{review.users?.first_name} {review.users?.last_name}</span>
              {' '}•{' '}
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </p>

            {/* Comment */}
            <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

            {/* Helpful buttons */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
              <button className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs">{review.helpful_count || 0}</span>
              </button>
              <button className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-2 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-xs">{review.unhelpful_count || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
