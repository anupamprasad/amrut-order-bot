-- Migration to update bottle types from 20L/10L to 200ml/300ml/500ml
-- Run this in Supabase SQL Editor if you already have the old schema

-- Step 1: Drop the existing constraint completely
ALTER TABLE orders DROP CONSTRAINT orders_bottle_type_check;

-- Step 2: Update existing orders (if any)
UPDATE orders SET bottle_type = '500ml' WHERE bottle_type = '20L';
UPDATE orders SET bottle_type = '300ml' WHERE bottle_type = '10L';

-- Step 3: Add new constraint with updated bottle types
ALTER TABLE orders ADD CONSTRAINT orders_bottle_type_check 
    CHECK (bottle_type IN ('200ml', '300ml', '500ml'));
