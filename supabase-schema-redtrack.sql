-- ============================================================
-- Remi — RedTrack + Telegram Schema
-- Run AFTER the base supabase-schema.sql
-- ============================================================

-- ── RedTrack Cache ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redtrack_cache (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  epc         NUMERIC DEFAULT 0,
  roi         NUMERIC DEFAULT 0,
  profit      NUMERIC DEFAULT 0,
  clicks      BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  revenue     NUMERIC DEFAULT 0,
  cost        NUMERIC DEFAULT 0,
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redtrack_cache_campaign ON redtrack_cache (campaign_id);
CREATE INDEX IF NOT EXISTS idx_redtrack_cache_synced ON redtrack_cache (synced_at);

-- ── Campaign Mapping (RedTrack ↔ Meta) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_mapping (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  redtrack_campaign_name  TEXT NOT NULL,
  meta_campaign_id        TEXT NOT NULL,
  meta_campaign_name      TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (redtrack_campaign_name, meta_campaign_id)
);

-- ── Alert History ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alert_history (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id         TEXT NOT NULL,
  campaign_name       TEXT,
  roi                 NUMERIC,
  threshold           NUMERIC,
  action              TEXT CHECK (action IN ('paused', 'snoozed', 'ignored', 'pending')),
  telegram_message_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_history_campaign ON alert_history (campaign_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_created ON alert_history (created_at DESC);

-- ── Snooze State ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS snooze_state (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id   TEXT NOT NULL UNIQUE,
  campaign_name TEXT,
  snoozed_until TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snooze_state_until ON snooze_state (snoozed_until);

-- ── Bot Config ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bot_config (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  telegram_token  TEXT,
  telegram_chat_id TEXT,
  redtrack_api_key TEXT,
  roi_threshold   NUMERIC DEFAULT 25,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: service role only for cache/alert tables
ALTER TABLE redtrack_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE snooze_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY redtrack_cache_read ON redtrack_cache FOR SELECT USING (true);
CREATE POLICY campaign_mapping_read ON campaign_mapping FOR SELECT USING (true);
CREATE POLICY alert_history_read ON alert_history FOR SELECT USING (true);
CREATE POLICY snooze_state_read ON snooze_state FOR SELECT USING (true);
CREATE POLICY bot_config_read ON bot_config FOR SELECT USING (true);
