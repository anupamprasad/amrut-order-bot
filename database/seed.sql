-- Sample data for testing (Run this after schema.sql)

-- Insert sample users
-- Note: In production, users should be created through Supabase Auth
-- These are for testing purposes only

INSERT INTO users (id, company_name, contact_name, mobile_number, email) VALUES
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Sunrise Hotels', 'Rajesh Kumar', '+91-9876543210', 'rajesh@sunrisehotels.com'),
    ('b2c3d4e5-f6a7-8901-2345-678901bcdefg', 'Green Valley Resort', 'Priya Sharma', '+91-9876543211', 'priya@greenvalley.com'),
    ('c3d4e5f6-a7b8-9012-3456-789012cdefgh', 'City Café', 'Amit Patel', '+91-9876543212', 'amit@citycafe.com');

-- Insert sample orders
INSERT INTO orders (user_id, bottle_type, quantity, delivery_address, preferred_delivery_date, order_status) VALUES
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', '20L', 50, '123 MG Road, Bangalore, Karnataka 560001', '2025-12-22', 'Confirmed'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', '10L', 30, '123 MG Road, Bangalore, Karnataka 560001', '2025-12-20', 'Delivered'),
    ('b2c3d4e5-f6a7-8901-2345-678901bcdefg', '20L', 100, '456 Park Street, Kolkata, West Bengal 700016', '2025-12-23', 'Pending'),
    ('c3d4e5f6-a7b8-9012-3456-789012cdefgh', '10L', 20, '789 Brigade Road, Bangalore, Karnataka 560025', '2025-12-21', 'Confirmed');
