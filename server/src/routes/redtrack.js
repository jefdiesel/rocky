const { Router } = require('express');
const RedTrackAPI = require('../services/redtrack');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// ── GET /redtrack/campaigns — Return cached RedTrack data ────────────────────
router.get('/campaigns', verifyToken, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });

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
    const apiKey = process.env.REDTRACK_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'REDTRACK_API_KEY not configured.' });
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });

    const rt = new RedTrackAPI(apiKey);
    const result = await rt.getCampaigns();

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    const rows = RedTrackAPI.normalize(result.data);

    if (rows.length > 0) {
      const { error: upsertErr } = await supabase
        .from('redtrack_cache')
        .insert(rows.map((r) => ({
          campaign_id: r.campaign_id,
          campaign_name: r.campaign_name,
          epc: r.epc,
          roi: r.roi,
          profit: r.profit,
          clicks: r.clicks,
          conversions: r.conversions,
          revenue: r.revenue,
          cost: r.cost,
        })));

      if (upsertErr) {
        console.error('[redtrack] Cache insert error:', upsertErr.message);
      }
    }

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
