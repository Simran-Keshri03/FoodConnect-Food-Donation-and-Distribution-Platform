-- ============================================================
-- FoodConnect Sample Seed Data (MySQL 8)
-- Passwords below are all BCrypt-hashed for: password123
-- BCrypt Hash: $2a$10$wT8zQ1OszK29t2r/QxJkme1C8f0ZcM9UqYV3Uu9mF5fW6c2A6R4fS
-- ============================================================

USE foodconnect_db;

-- Insert Users (Donor, NGO, Volunteer)
INSERT INTO users (id, full_name, email, password, phone, role, address, created_at)
VALUES 
(1, 'Green Leaf Bakery', 'donor@foodconnect.org', '$2a$10$wT8zQ1OszK29t2r/QxJkme1C8f0ZcM9UqYV3Uu9mF5fW6c2A6R4fS', '+1-555-0101', 'DONOR', '124 Market Street, Metro City', NOW()),
(2, 'City Harvest NGO', 'ngo@foodconnect.org', '$2a$10$wT8zQ1OszK29t2r/QxJkme1C8f0ZcM9UqYV3Uu9mF5fW6c2A6R4fS', '+1-555-0202', 'NGO', '45 Community Road, Metro City', NOW()),
(3, 'Alex Johnson (Volunteer)', 'volunteer@foodconnect.org', '$2a$10$wT8zQ1OszK29t2r/QxJkme1C8f0ZcM9UqYV3Uu9mF5fW6c2A6R4fS', '+1-555-0303', 'VOLUNTEER', '78 Oak Avenue, Metro City', NOW()),
(4, 'Sunshine Bistro', 'bistro@foodconnect.org', '$2a$10$wT8zQ1OszK29t2r/QxJkme1C8f0ZcM9UqYV3Uu9mF5fW6c2A6R4fS', '+1-555-0404', 'DONOR', '89 culinary Blvd, Metro City', NOW()),
(5, 'Hope Shelter NGO', 'hope@foodconnect.org', '$2a$10$wT8zQ1OszK29t2r/QxJkme1C8f0ZcM9UqYV3Uu9mF5fW6c2A6R4fS', '+1-555-0505', 'NGO', '12 Shelter Lane, Metro City', NOW())
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Insert Sample Food Donations
INSERT INTO food_donations (id, title, description, category, quantity, servings, pickup_address, prepared_at, expires_at, status, donor_id, version, created_at)
VALUES
(1, 'Fresh Artisan Sourdough Breads', 'Assorted sourdough loaves and baguettes freshly baked this morning.', 'Bakery', '25 loaves', 50, '124 Market Street, Metro City', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 24 HOUR), 'AVAILABLE', 1, 0, NOW()),
(2, 'Hot Cooked Vegetable Pulao & Curry', 'Steam tray of nutritious rice pulao and mixed vegetable curry packed hygienically in food-grade trays.', 'Cooked Meals', '15 kg', 60, '89 culinary Blvd, Metro City', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 6 HOUR), 'AVAILABLE', 4, 0, NOW()),
(3, 'Organic Farm Apples & Oranges', 'Freshly harvested apples and oranges in ventilated crates.', 'Produce', '40 kg', 100, '124 Market Street, Metro City', DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_ADD(NOW(), INTERVAL 48 HOUR), 'AVAILABLE', 1, 0, NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);
