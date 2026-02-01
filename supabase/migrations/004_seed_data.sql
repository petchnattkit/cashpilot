-- Seed data for SKUs and Categories
-- This migration inserts sample data for testing and development

-- Insert sample SKUs (Products/Services)
INSERT INTO skus (code, name, description)
VALUES 
    ('SKU-001', 'Laptop Computer', 'High-performance laptop for office work'),
    ('SKU-002', 'Office Chair', 'Ergonomic office chair for comfortable working'),
    ('SKU-003', 'Web Design Service', 'Professional web design and development services'),
    ('SKU-004', 'Consulting Hours', 'Business consulting and advisory services'),
    ('SKU-005', 'Software License', 'Annual software subscription license')
ON CONFLICT (code) DO NOTHING;

-- Insert sample Categories
INSERT INTO categories (name, type)
VALUES 
    ('Sales', 'in'),
    ('Rent', 'out'),
    ('Utilities', 'out'),
    ('Consulting', 'in'),
    ('General', 'both')
ON CONFLICT (name) DO NOTHING;
