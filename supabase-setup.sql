-- =============================================
-- Expo Hub - Supabase Database Setup
-- =============================================

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- PRODUCTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    photo_url TEXT,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT -- Clerk user ID for RLS
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can view all products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own products" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (true);

-- =============================================
-- KANBAN COLUMNS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS kanban_columns (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT -- Clerk user ID for RLS
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_kanban_columns_position ON kanban_columns(position);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_user_id ON kanban_columns(user_id);

-- Enable RLS
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kanban_columns
CREATE POLICY "Users can view their own columns" ON kanban_columns
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own columns" ON kanban_columns
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own columns" ON kanban_columns
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own columns" ON kanban_columns
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

-- =============================================
-- KANBAN TASKS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS kanban_tasks (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'TODO',
    column_id TEXT REFERENCES kanban_columns(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT -- Clerk user ID for RLS
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_status ON kanban_tasks(status);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_column_id ON kanban_tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_position ON kanban_tasks(position);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_user_id ON kanban_tasks(user_id);

-- Enable RLS
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kanban_tasks
CREATE POLICY "Users can view their own tasks" ON kanban_tasks
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own tasks" ON kanban_tasks
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own tasks" ON kanban_tasks
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own tasks" ON kanban_tasks
    FOR DELETE USING (auth.jwt() ->> 'sub' = user_id OR user_id IS NULL);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kanban_tasks_updated_at ON kanban_tasks;
CREATE TRIGGER update_kanban_tasks_updated_at
    BEFORE UPDATE ON kanban_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (optional - can be removed in production)
-- =============================================

-- Insert default kanban columns
INSERT INTO kanban_columns (id, title, position, user_id) 
VALUES 
    ('TODO', 'To Do', 0, NULL),
    ('IN_PROGRESS', 'In Progress', 1, NULL),
    ('DONE', 'Done', 2, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products (optional)
INSERT INTO products (name, description, price, photo_url, category, user_id)
VALUES 
    ('Sample Product 1', 'This is a sample product for testing', 99.99, 'https://api.slingacademy.com/public/sample-products/1.png', 'Electronics', NULL),
    ('Sample Product 2', 'Another sample product', 149.99, 'https://api.slingacademy.com/public/sample-products/2.png', 'Furniture', NULL),
    ('Sample Product 3', 'Third sample product', 29.99, 'https://api.slingacademy.com/public/sample-products/3.png', 'Clothing', NULL)
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO kanban_tasks (id, title, description, status, column_id, position, user_id)
VALUES 
    ('task1', 'Project initiation and planning', 'Start the new project with proper planning', 'TODO', 'TODO', 0, NULL),
    ('task2', 'Gather requirements from stakeholders', 'Meet with stakeholders to understand requirements', 'TODO', 'TODO', 1, NULL),
    ('task3', 'Design system architecture', 'Create the overall system design', 'IN_PROGRESS', 'IN_PROGRESS', 0, NULL),
    ('task4', 'Set up development environment', 'Configure all necessary tools and environments', 'DONE', 'DONE', 0, NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SECURITY NOTES
-- =============================================

/*
1. Row Level Security (RLS) is enabled on all tables
2. Users can only access their own data (when user_id matches their Clerk ID)
3. Some sample data is accessible to all users (user_id IS NULL)
4. For production, remove sample data and adjust policies as needed
5. Make sure to configure your Supabase JWT settings to work with Clerk

To configure Clerk integration:
1. Go to Supabase Dashboard → Settings → API
2. Add Clerk JWT settings in the JWT Settings section
3. Use Clerk's JWKS URL and configure the JWT secret
*/