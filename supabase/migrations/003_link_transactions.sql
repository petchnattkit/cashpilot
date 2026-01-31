-- Add foreign keys
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS sku_id UUID REFERENCES skus(id),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_sku_id ON transactions(sku_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);

-- Migration logic to move existing text data to master tables
DO $$
BEGIN
    -- Migrate Categories
    -- Insert distinct categories from transactions if they don't exist
    INSERT INTO categories (name, type)
    SELECT DISTINCT category, 'both'
    FROM transactions
    WHERE category IS NOT NULL
    ON CONFLICT (name) DO NOTHING;

    -- Update transactions with category_id
    UPDATE transactions t
    SET category_id = c.id
    FROM categories c
    WHERE t.category = c.name
    AND t.category_id IS NULL;

    -- Migrate SKUs
    -- Insert distinct skus from transactions if they don't exist
    -- Using sku text as both code and name initially
    INSERT INTO skus (code, name)
    SELECT DISTINCT sku, sku
    FROM transactions
    WHERE sku IS NOT NULL
    ON CONFLICT (code) DO NOTHING;

    -- Update transactions with sku_id
    UPDATE transactions t
    SET sku_id = s.id
    FROM skus s
    WHERE t.sku = s.code
    AND t.sku_id IS NULL;

END $$;
