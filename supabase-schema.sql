-- ============================================================
-- Rocky Ads Platform — Supabase Postgres Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meta_user_id  TEXT UNIQUE,
  name          TEXT,
  email         TEXT,
  access_token  TEXT,            -- encrypted at application layer
  token_expiry  TIMESTAMPTZ,
  system_token  TEXT,            -- system user token (optional)
  session_token TEXT UNIQUE,     -- server-issued session id
  session_expiry TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_meta_user_id  ON users (meta_user_id);
CREATE INDEX idx_users_session_token ON users (session_token);

-- ============================================================
-- AD ACCOUNTS
-- ============================================================
CREATE TABLE ad_accounts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id  TEXT NOT NULL,
  name        TEXT,
  currency    TEXT,
  timezone    TEXT,
  spend_cap   NUMERIC,
  status      INT,
  business_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, account_id)
);

CREATE INDEX idx_ad_accounts_user_id    ON ad_accounts (user_id);
CREATE INDEX idx_ad_accounts_account_id ON ad_accounts (account_id);

-- ============================================================
-- INSIGHTS CACHE
-- ============================================================
CREATE TABLE insights_cache (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id  TEXT NOT NULL,
  object_id   TEXT NOT NULL,
  object_type TEXT NOT NULL,      -- campaign | adset | ad
  level       TEXT NOT NULL,      -- campaign | adset | ad
  date_start  DATE,
  date_end    DATE,
  breakdowns  TEXT,               -- comma-separated breakdown keys
  metrics     JSONB NOT NULL DEFAULT '{}'::jsonb,
  cached_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 minutes')
);

CREATE INDEX idx_insights_cache_account   ON insights_cache (account_id);
CREATE INDEX idx_insights_cache_object    ON insights_cache (object_id);
CREATE INDEX idx_insights_cache_expires   ON insights_cache (expires_at);
CREATE INDEX idx_insights_cache_cached_at ON insights_cache (cached_at);

-- ============================================================
-- AUDIENCES CACHE
-- ============================================================
CREATE TABLE audiences_cache (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id        TEXT NOT NULL,
  audience_id       TEXT NOT NULL,
  name              TEXT,
  type              TEXT,
  subtype           TEXT,
  approximate_count BIGINT,
  status            TEXT,
  data              JSONB NOT NULL DEFAULT '{}'::jsonb,
  cached_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audiences_cache_account ON audiences_cache (account_id);
CREATE INDEX idx_audiences_cache_cached  ON audiences_cache (cached_at);

-- ============================================================
-- CREATIVE ASSETS
-- ============================================================
CREATE TABLE creative_assets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id      TEXT NOT NULL,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meta_asset_id   TEXT,
  type            TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url             TEXT,
  dimensions      TEXT,          -- e.g. "1080x1080"
  file_size       BIGINT,
  approval_status TEXT DEFAULT 'PENDING',
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_creative_assets_account ON creative_assets (account_id);
CREATE INDEX idx_creative_assets_user    ON creative_assets (user_id);

-- ============================================================
-- UTM TEMPLATES
-- ============================================================
CREATE TABLE utm_templates (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  source     TEXT,
  medium     TEXT,
  campaign   TEXT,
  content    TEXT,
  term       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_utm_templates_user ON utm_templates (user_id);

-- ============================================================
-- DRAFT CAMPAIGNS
-- ============================================================
CREATE TABLE draft_campaigns (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  name       TEXT NOT NULL,
  config     JSONB NOT NULL DEFAULT '{}'::jsonb,
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_draft_campaigns_user    ON draft_campaigns (user_id);
CREATE INDEX idx_draft_campaigns_account ON draft_campaigns (account_id);

-- ============================================================
-- CAMPAIGNS CACHE
-- ============================================================
CREATE TABLE campaigns_cache (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id  TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  cached_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_cache_account ON campaigns_cache (account_id);
CREATE INDEX idx_campaigns_cache_cached  ON campaigns_cache (cached_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns_cache ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so these policies are for anon/authenticated roles.
-- Users can only see their own rows.

CREATE POLICY users_self ON users
  FOR ALL USING (id = auth.uid());

CREATE POLICY ad_accounts_owner ON ad_accounts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY creative_assets_owner ON creative_assets
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY utm_templates_owner ON utm_templates
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY draft_campaigns_owner ON draft_campaigns
  FOR ALL USING (user_id = auth.uid());

-- Cache tables: allow read for authenticated, write via service role only.
CREATE POLICY insights_cache_read ON insights_cache
  FOR SELECT USING (true);

CREATE POLICY audiences_cache_read ON audiences_cache
  FOR SELECT USING (true);

CREATE POLICY campaigns_cache_read ON campaigns_cache
  FOR SELECT USING (true);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ad_accounts_updated_at
  BEFORE UPDATE ON ad_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_utm_templates_updated_at
  BEFORE UPDATE ON utm_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_draft_campaigns_updated_at
  BEFORE UPDATE ON draft_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
