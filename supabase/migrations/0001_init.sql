-- Prooved — initial schema
-- Run via Supabase MCP / SQL editor / `supabase db push`.

-- ─── Tables ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,                          -- equals auth.users.id
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  slug TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE,
  wallet_verified_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_slug_idx ON public.users (slug);

CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ebay','vinted','kleinanzeigen','paypal')),
  platform_user_id TEXT,
  platform_url TEXT NOT NULL,
  verify_token TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  method TEXT NOT NULL CHECK (method IN ('oauth','bio_code','scrape')),
  tier TEXT NOT NULL CHECK (tier IN ('gold','silver','bronze')),
  rating_score FLOAT,
  rating_count INT,
  positive_count INT,
  negative_count INT,
  member_since TIMESTAMPTZ,
  last_fetched TIMESTAMPTZ,
  on_chain_tx_id TEXT,
  signed_payload TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS connections_user_idx ON public.connections (user_id);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reporter_ip TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS reports_target_idx ON public.reports (target_id);

CREATE TABLE IF NOT EXISTS public.wallet_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  signature TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  chain TEXT NOT NULL DEFAULT 'solana'
);

CREATE TABLE IF NOT EXISTS public.data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload_hash TEXT NOT NULL
);

-- ─── RLS ──────────────────────────────────────────────────

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_proofs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports   ENABLE ROW LEVEL SECURITY;

-- users: own row read+write; anyone may read public columns (slug, name, etc.)
DROP POLICY IF EXISTS users_own ON public.users;
CREATE POLICY users_own ON public.users
  FOR ALL USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS users_public_read ON public.users;
CREATE POLICY users_public_read ON public.users
  FOR SELECT USING (true);

-- connections: own; public may read verified connections only
DROP POLICY IF EXISTS connections_own ON public.connections;
CREATE POLICY connections_own ON public.connections
  FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS connections_public_read ON public.connections;
CREATE POLICY connections_public_read ON public.connections
  FOR SELECT USING (verified_at IS NOT NULL);

-- reports: anyone may insert (anonymous), no public read
DROP POLICY IF EXISTS reports_insert ON public.reports;
CREATE POLICY reports_insert ON public.reports
  FOR INSERT WITH CHECK (true);

-- wallet_proofs: own only
DROP POLICY IF EXISTS wallet_own ON public.wallet_proofs;
CREATE POLICY wallet_own ON public.wallet_proofs
  FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- data_exports: own only
DROP POLICY IF EXISTS exports_own ON public.data_exports;
CREATE POLICY exports_own ON public.data_exports
  FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
