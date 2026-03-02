-- KINBEN Categories Seed Data
-- Insert sample categories for the e-commerce platform

INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
  ('Shirts', 'shirts', 'Casual and formal shirts for everyday wear and special occasions', 1, true),
  ('Panjabis', 'panjabis', 'Traditional and modern panjabis for ethnic and casual events', 2, true),
  ('Polos', 'polos', 'Classic polo shirts perfect for casual and semi-formal settings', 3, true),
  ('Pants', 'pants', 'Comfortable trousers and chinos in various styles and colors', 4, true),
  ('Katua', 'katua', 'Traditional seasonal clothing for cultural occasions and festivals', 5, true)
ON CONFLICT (slug) DO NOTHING;
