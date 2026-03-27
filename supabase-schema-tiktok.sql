-- ============================================================
-- Remi — TikTok Platform Migration
-- Run AFTER the base supabase-schema.sql
-- ============================================================

-- ── Add platform column to shared tables ─────────────────────────────────────

ALTER TABLE ad_accounts ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'meta';
ALTER TABLE insights_cache ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'meta';
ALTER TABLE audiences_cache ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'meta';
ALTER TABLE campaigns_cache ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'meta';
ALTER TABLE creative_assets ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'meta';
ALTER TABLE draft_campaigns ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'meta';

-- ── Add TikTok fields to users ───────────────────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS tiktok_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tiktok_user_id TEXT;

-- ── Update unique constraint on ad_accounts to include platform ──────────────

ALTER TABLE ad_accounts DROP CONSTRAINT IF EXISTS ad_accounts_user_id_account_id_key;
ALTER TABLE ad_accounts ADD CONSTRAINT ad_accounts_user_id_account_id_platform_key UNIQUE (user_id, account_id, platform);

-- ── Indexes for platform filtering ───────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ad_accounts_platform ON ad_accounts (platform);
CREATE INDEX IF NOT EXISTS idx_insights_cache_platform ON insights_cache (platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_cache_platform ON campaigns_cache (platform);
CREATE INDEX IF NOT EXISTS idx_users_tiktok_user_id ON users (tiktok_user_id);
