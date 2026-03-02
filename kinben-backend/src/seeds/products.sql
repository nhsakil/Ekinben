-- KINBEN Sample Products Seed Data
-- Insert sample products for testing and demonstration

-- Get category IDs
-- Note: In a real system, you'd use the actual UUIDs returned from categories table

-- Sample Shirts
INSERT INTO products (name, slug, description, long_description, category_id, sku, price, compare_price, stock_quantity, color, material, is_active, is_featured)
SELECT
  'Classic White Shirt',
  'classic-white-shirt',
  'Timeless white shirt perfect for any occasion',
  'A versatile white shirt made from premium cotton. Perfect for both casual and formal settings. Features a comfortable fit and breathable fabric.',
  id,
  'SHIRT-001',
  1490,
  1790,
  50,
  'White',
  'Cotton',
  true,
  true
FROM categories WHERE slug = 'shirts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, slug, description, long_description, category_id, sku, price, compare_price, stock_quantity, color, material, is_active, is_featured)
SELECT
  'Navy Blue Formal Shirt',
  'navy-blue-formal-shirt',
  'Professional navy blue shirt for formal occasions',
  'Premium formal shirt in navy blue color. Made with a cotton-polyester blend for durability and easy maintenance. Ideal for business meetings and formal events.',
  id,
  'SHIRT-002',
  1690,
  1990,
  35,
  'Navy',
  'Cotton Blend',
  true,
  true
FROM categories WHERE slug = 'shirts'
ON CONFLICT (sku) DO NOTHING;

-- Sample Panjabis
INSERT INTO products (name, slug, description, long_description, category_id, sku, price, compare_price, stock_quantity, color, material, is_active, is_featured)
SELECT
  'Traditional Maroon Panjabi',
  'traditional-maroon-panjabi',
  'Elegant traditional panjabi for celebrations',
  'Beautiful maroon panjabi with traditional stitching and design. Perfect for Eid, weddings, and special cultural occasions. Made from high-quality cotton.',
  id,
  'PANJA-001',
  2490,
  2990,
  25,
  'Maroon',
  'Cotton',
  true,
  true
FROM categories WHERE slug = 'panjabis'
ON CONFLICT (sku) DO NOTHING;

-- Sample Polos
INSERT INTO products (name, slug, description, long_description, category_id, sku, price, compare_price, stock_quantity, color, material, is_active, is_featured)
SELECT
  'Casual Black Polo',
  'casual-black-polo',
  'Comfortable polo shirt for everyday wear',
  'Classic black polo shirt with a modern fit. Made from breathable cotton with a sleek design. Perfect for casual outings and relaxed work environments.',
  id,
  'POLO-001',
  1190,
  1490,
  60,
  'Black',
  'Cotton',
  true,
  true
FROM categories WHERE slug = 'polos'
ON CONFLICT (sku) DO NOTHING;

-- Sample Pants
INSERT INTO products (name, slug, description, long_description, category_id, sku, price, compare_price, stock_quantity, color, material, is_active, is_featured)
SELECT
  'Navy Chino Pants',
  'navy-chino-pants',
  'Versatile navy chino pants for all seasons',
  'High-quality navy chino pants available in multiple sizes. Comfortable fit with a modern cut. Perfect for both casual and semi-formal occasions.',
  id,
  'PANT-001',
  1890,
  2290,
  40,
  'Navy',
  'Cotton Blend',
  true,
  false
FROM categories WHERE slug = 'pants'
ON CONFLICT (sku) DO NOTHING;

-- Sample Katua
INSERT INTO products (name, slug, description, long_description, category_id, sku, price, compare_price, stock_quantity, color, material, is_active, is_featured)
SELECT
  'Cream Traditional Katua',
  'cream-traditional-katua',
  'Traditional katua for festive celebrations',
  'Beautiful cream-colored traditional katua with intricate embroidery. Perfect for Eid, weddings, and special celebrations. Made from soft and comfortable fabric.',
  id,
  'KATU-001',
  2190,
  2690,
  20,
  'Cream',
  'Cotton',
  true,
  true
FROM categories WHERE slug = 'katua'
ON CONFLICT (sku) DO NOTHING;
