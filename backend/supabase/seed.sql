-- Profiles
INSERT INTO profiles (id, email, full_name, role, eco_points) VALUES
('b3c8f8d5-1c3f-4e0a-a5f1-3d7c5e8c1b2a', 'alice@example.com', 'Alice Green', 'user', 150),
('f6b8a2c1-9d4e-4f7b-8c1a-2e3d5b4a6f7c', 'bob@example.com', 'Bob Builder', 'user', 80),
('d4e5f6a7-b8c9-1d2e-3f4a-5b6c7d8e9f0a', 'charlie@example.com', 'Charlie Chief', 'admin', 500);

-- Distribute sustainability metrics
INSERT INTO sustainability_metrics (user_id, total_carbon_saved_kg, items_reused, water_saved_liters, total_eco_points) VALUES
('b3c8f8d5-1c3f-4e0a-a5f1-3d7c5e8c1b2a', 15.5, 3, 50.0, 150),
('f6b8a2c1-9d4e-4f7b-8c1a-2e3d5b4a6f7c', 5.0, 1, 10.0, 80);

-- Reward Badges
INSERT INTO reward_badges (id, badge_name, description, required_points) VALUES
('c1b2a3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Eco Beginner', 'Earned 50 eco points', 50),
('d2c3b4a5-f6e7-5b8c-9d0e-1f2a3b4c5d6e', 'Reuse Champion', 'Earned 150 eco points', 150);

-- User Badges
INSERT INTO user_badges (user_id, badge_id) VALUES
('b3c8f8d5-1c3f-4e0a-a5f1-3d7c5e8c1b2a', 'c1b2a3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
('b3c8f8d5-1c3f-4e0a-a5f1-3d7c5e8c1b2a', 'd2c3b4a5-f6e7-5b8c-9d0e-1f2a3b4c5d6e'),
('f6b8a2c1-9d4e-4f7b-8c1a-2e3d5b4a6f7c', 'c1b2a3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Item Listings (Swap/Rent)
INSERT INTO item_listings (id, owner_id, title, description, category, condition, status, listing_type) VALUES
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'b3c8f8d5-1c3f-4e0a-a5f1-3d7c5e8c1b2a', 'Vintage Denim Jacket', 'Good condition, size M', 'Clothing', 'Good', 'available', 'swap'),
('b2c3d4a5-f6e7-5b8c-9d0e-1f2a3b4c5d6e', 'f6b8a2c1-9d4e-4f7b-8c1a-2e3d5b4a6f7c', 'Power Drill', 'Works perfectly. Renting for weekend DIYs.', 'Tools', 'Like New', 'available', 'rent');

-- Food Listings
INSERT INTO food_listings (id, donor_id, title, description, quantity, expiry_date, location, urgency_score, status) VALUES
('1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6', 'b3c8f8d5-1c3f-4e0a-a5f1-3d7c5e8c1b2a', '3 Loaves of Bread', 'Fresh from bakery, excess inventory', '3 items', NOW() + INTERVAL '2 days', 'Downtown Bakery', 8, 'available');

-- Upcycle Materials
INSERT INTO upcycle_materials (id, provider_id, material_type, description, quantity, weight_kg, status, reuse_potential_score) VALUES
('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'f6b8a2c1-9d4e-4f7b-8c1a-2e3d5b4a6f7c', 'Wood Pallets', 'Clean oak pallets, great for furniture', '5 pallets', 50.0, 'available', 95);
