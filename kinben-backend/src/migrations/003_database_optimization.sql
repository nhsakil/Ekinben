-- Database Optimization Migrations
-- Phase 8: Security & Performance Enhancement
-- Adds missing indexes for optimal query performance

-- ============= PRODUCT PERFORMANCE INDEXES =============

-- Index on products created_at for sorting
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Composite index for product filtering by category and status
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);

-- Index on product prices for price filtering
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ============= NEWSLETTER PERFORMANCE INDEXES =============

-- Index on newsletter subscriptions status
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);

-- Index on newsletter email for lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);

-- Index on newsletter subscribed_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscriptions(subscribed_at);

-- ============= BLOG PERFORMANCE INDEXES =============

-- Index on blog posts status
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- Index on blog posts published_at for sorting
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- Index on blog posts author for author queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- Composite index for blog published status and date
CREATE INDEX IF NOT EXISTS idx_blog_published_date ON blog_posts(status, published_at DESC);

-- ============= REVIEW PERFORMANCE INDEXES =============

-- Index on reviews status for pending reviews
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Composite index for product reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status);

-- Index on reviews created_at for sorting
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============= ORDER PERFORMANCE INDEXES =============

-- Index on orders created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Composite index for user orders
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, order_status);

-- Index on orders payment status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- ============= CART PERFORMANCE INDEXES =============

-- Index on cart items added_at for cleanup
CREATE INDEX IF NOT EXISTS idx_cart_items_added_at ON cart_items(added_at);

-- ============= USER PERFORMANCE INDEXES =============

-- Index on users created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Index on users is_active for active user queries
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Index on users last_login for analyzing user activity
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- ============= ADDRESS PERFORMANCE INDEXES =============

-- Index on default addresses for quick lookup
CREATE INDEX IF NOT EXISTS idx_addresses_default_shipping ON addresses(user_id, is_default_shipping);

CREATE INDEX IF NOT EXISTS idx_addresses_default_billing ON addresses(user_id, is_default_billing);

-- ============= FULL-TEXT SEARCH INDEXES =============

-- Full-text search indexes for product search (if needed in future)
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;
-- CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- ============= PARTIAL INDEXES =============

-- Partial index for active products only (faster for common queries)
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products(is_featured)
WHERE is_active = true;

-- Partial index for active blogs only
CREATE INDEX IF NOT EXISTS idx_blog_active ON blog_posts(slug)
WHERE status = 'published';

-- Partial index for subscribed newsletters
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscriptions(email)
WHERE status = 'subscribed';

-- ============= ANALYZE STATISTICS =============

-- Update table statistics for query planner optimization
ANALYZE users;
ANALYZE products;
ANALYZE orders;
ANALYZE reviews;
ANALYZE blog_posts;
ANALYZE newsletter_subscriptions;
ANALYZE addresses;
ANALYZE cart_items;
ANALYZE wishlist_items;

COMMIT;
