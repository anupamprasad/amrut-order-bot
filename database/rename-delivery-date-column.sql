-- Migration: Rename preferred_delivery_date to delivery_date
-- Run this in Supabase SQL Editor

-- Rename the column
ALTER TABLE orders 
RENAME COLUMN preferred_delivery_date TO delivery_date;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
