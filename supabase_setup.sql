-- ============================================================
-- GLOBEAM RETAIL SAATHI — Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────
-- 1. PRODUCTS TABLE (master list)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL UNIQUE,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────
-- 2. INVENTORY TABLE (current stock levels — PER USER)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT inventory_product_user_unique UNIQUE (product_id, user_id)
);

-- ─────────────────────────────────────────────────────────
-- 3. TRANSACTIONS TABLE (audit log — PER USER)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('PURCHASE', 'SALE')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (scope inventory & transactions to user)
-- ─────────────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Products: all authenticated users can read/write (shared catalog)
CREATE POLICY "auth_users_products" ON products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inventory: each user can only view/manage their own stock
CREATE POLICY "user_inventory_policy" ON inventory
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions: each user can only view/manage their own logs
CREATE POLICY "user_transactions_policy" ON transactions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────
-- 5. ENABLE REALTIME on inventory
-- ─────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- ─────────────────────────────────────────────────────────
-- Ensure unique constraint exists on existing table
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_product_name_key;
ALTER TABLE products ADD CONSTRAINT products_product_name_key UNIQUE (product_name);

INSERT INTO products (product_name, sku) VALUES
  -- Gold Series Torches
  ('GL-50', 'GL50'),
  ('GL-52', 'GL52'),
  ('GL-54', 'GL54'),
  ('GL-56', 'GL56'),
  ('GL-58', 'GL58'),
  ('GL-60', 'GL60'),
  ('GL-62', 'GL62'),

  -- Battery Powered Torches
  ('Dolphin', 'DOLPHIN'),
  ('Mini-Dolphin', 'MDOLPHIN'),
  ('Rockstar', 'ROCKSTAR'),
  ('Passion', 'PASSION'),
  ('Koyal', 'KOYAL'),
  ('Maxx Plus', 'MAXXPLUS'),
  ('Leo', 'LEO'),
  ('Fly', 'FLY'),
  ('Venus 3G', 'VENUS3G'),
  ('Nano', 'NANO'),
  ('GL-111', 'GL111'),
  ('GL-111 Mini', 'GL111M'),
  ('GL-222', 'GL222'),
  ('92', '92'),
  ('72', '72'),
  ('180', '180'),
  ('36', '36'),

  -- Head Lamps
  ('Jugnu', 'JUGNU'),
  ('Jugnu Plus', 'JUGNUP'),
  ('Nexa', 'NEXA'),
  ('Thar', 'THAR'),

  -- Chargers & Accessories
  ('DC Pin Charger', 'DCPINCHG'),
  ('Direct Battery Charger', 'DIRBATCHG'),
  ('Agriculture Spray Machine Charger', 'AGRIAPCHG'),
  ('Solar Panel 3.5W', 'SOLAR3.5W'),

  -- Lithium Powered Charging Torches
  ('Raksha', 'RAKSHA'),
  ('Hero', 'HERO'),
  ('Tarzan', 'TARZAN'),
  ('Ranger', 'RANGER'),
  ('Rocky', 'ROCKY'),
  ('Disha', 'DISHA'),
  ('Sitara', 'SITARA'),
  ('Julie', 'JULIE'),
  ('6000', '6000'),

  -- Heavy Range Kisan Torches
  ('9900', '9900'),
  ('Sainik', 'SAINIK'),
  ('Barkha-Solar', 'BARKHASOLAR'),
  ('Arjun', 'ARJUN'),
  ('Sultan', 'SULTAN'),
  ('Badal', 'BADAL'),
  ('Badal-Solar', 'BADALSOLAR'),

  -- Multipurpose Rechargeable Kisan Torches
  ('7700', '7700'),
  ('6900', '6900'),
  ('Noorie', 'NOORIE'),
  ('Bhoomi', 'BHOOMI'),
  ('Josh', 'JOSH'),
  ('Saathi', 'SAATHI'),
  ('Mili', 'MILI'),

  -- Original Sample Products
  ('Mini GL-006', 'MGL006'),
  ('Mini Plus', 'MPLUS'),
  ('Drishti 360', 'DRS360'),
  ('Magic Torch', 'MTRCH'),

  -- New Added Products
  ('Hunter', 'HUNTER'),
  ('Sumo', 'SUMO'),
  ('Damini', 'DAMINI'),
  ('Noorie -pro', 'NOORIEPRO'),
  ('Drishti -360', 'DRISHTI360'),
  ('Nikki', 'NIKKI'),
  ('Magic', 'MAGIC'),
  ('GL -006 mini', 'GL006MINI'),
  ('GL-007 mini plus', 'GL007MINIPLUS'),
  ('Solar lamp -5250', 'SOLARLAMP5250'),
  ('1 AMP Charger', '1AMPCHG'),
  ('2 AMP Charger', '2AMPCHG'),
  ('3040', '3040'),
  ('6450', '6450'),
  ('Infrared Cooktop', 'INFCOOKTOP')
ON CONFLICT (product_name) DO UPDATE SET sku = EXCLUDED.sku;

-- Note: Inventory rows are automatically created per-user by the app on login.

-- ─────────────────────────────────────────────────────────
-- Done! Verify with:
-- SELECT * FROM products;
-- SELECT * FROM inventory;
-- ─────────────────────────────────────────────────────────
