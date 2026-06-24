-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- This migration adds the pre-computed columns for 1 Million+ user scalability

-- 1. Add the new columns to the customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS days_since_order INTEGER DEFAULT 999,
ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0;

-- 2. Populate the columns with existing data from the orders table
UPDATE customers c
SET 
  total_spent = COALESCE((SELECT SUM(amount) FROM orders o WHERE o.customer_id = c.id), 0),
  order_count = COALESCE((SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id), 0),
  days_since_order = COALESCE(
    (SELECT EXTRACT(DAY FROM (NOW() - MAX(ordered_at))) 
     FROM orders o 
     WHERE o.customer_id = c.id), 
    999
  );

-- 3. (Optional but recommended) Add Indexes to speed up AI queries!
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);
CREATE INDEX IF NOT EXISTS idx_customers_days_since ON customers(days_since_order);
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent);
