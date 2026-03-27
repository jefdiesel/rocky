const { Router } = require('express');
const RedTrackAPI = require('../services/redtrack');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// ── Shared sync logic ────────────────────────────────────────────────────────
async function syncFromRedTrack() {
  const apiKey = process.env.REDTRACK_API_KEY;
  if (!apiKey || !supabase) return [];

  const rt = new RedTrackAPI(apiKey);
  const result = await rt.getCampaigns();
  if (!result.success || !result.data) return [];

  const rows = RedTrackAPI.normalize(Array.isArray(result.data) ? result.data : []);

  if (rows.length > 0) {
    await supabase.from('redtrack_cache').insert(rows.map((r) => ({
      campaign_id: r.campaign_id,
      campaign_name: r.campaign_name,
      epc: r.epc,
      roi: r.roi,
      profit: r.profit,
      clicks: r.clicks,
      conversions: r.conversions,
      revenue: r.revenue,
      cost: r.cost,
    }))).catch((err) => console.error('[redtrack] Cache insert error:', err.message));
  }

  return rows;
}

// ── GET /redtrack/campaigns — Auto-sync if cache is stale, then return ───────
router.get('/campaigns', verifyToken, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });

    // Check cache freshness
    const { data: latest } = await supabase
      .from('redtrack_cache')
      .select('synced_at')
      .order('synced_at', { ascending: false })
      .limit(1)
      .single();

    const isStale = !latest || (Date.now() - new Date(latest.synced_at).getTime()) > CACHE_TTL;

    // Auto-sync if stale and API key is set
    if (isStale && process.env.REDTRACK_API_KEY) {
      const fresh = await syncFromRedTrack();
      if (fresh.length > 0) {
        return res.json({ data: fresh, synced_at: new Date().toISOString() });
      }
    }

    // Return cached data
    const { data, error } = await supabase
      .from('redtrack_cache')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[redtrack] Cache fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch RedTrack data.' });
    }

    // Dedupe: keep only latest entry per campaign_id
    const seen = new Set();
    const deduped = [];
    for (const row of (data || [])) {
      if (!seen.has(row.campaign_id)) {
        seen.add(row.campaign_id);
        deduped.push(row);
      }
    }

    return res.json({ data: deduped });
  } catch (err) {
    console.error('[redtrack] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch RedTrack data.' });
  }
});

// ── GET /redtrack/sync — Force manual sync ───────────────────────────────────
router.get('/sync', verifyToken, async (req, res) => {
  try {
    const rows = await syncFromRedTrack();
    return res.json({ data: rows, synced_at: new Date().toISOString() });
  } catch (err) {
    console.error('[redtrack] Sync error:', err.message);
    return res.status(500).json({ error: 'Failed to sync RedTrack data.' });
  }
});

// ── GET /redtrack/mappings — List campaign mappings ──────────────────────────
router.get('/mappings', verifyToken, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });
    const { data, error } = await supabase.from('campaign_mapping').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /redtrack/mappings — Create campaign mapping ────────────────────────
router.post('/mappings', verifyToken, async (req, res) => {
  try {
    const { redtrack_campaign_name, meta_campaign_id, meta_campaign_name } = req.body;
    if (!redtrack_campaign_name || !meta_campaign_id) {
      return res.status(400).json({ error: 'redtrack_campaign_name and meta_campaign_id are required.' });
    }
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });

    const { data, error } = await supabase
      .from('campaign_mapping')
      .upsert({ redtrack_campaign_name, meta_campaign_id, meta_campaign_name }, { onConflict: 'redtrack_campaign_name,meta_campaign_id' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /redtrack/mappings/:id — Remove mapping ───────────────────────────
router.delete('/mappings/:id', verifyToken, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });
    const { error } = await supabase.from('campaign_mapping').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: { deleted: true } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
