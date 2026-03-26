const { Router } = require('express');
const MetaAPI = require('../services/meta');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

const CACHE_TTL_MS = 15 * 60 * 1000;

// ── GET /audiences/:accountId — List custom audiences ────────────────────────
router.get('/:accountId', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;

    // Check cache
    if (supabase) {
      const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
      const { data: cached } = await supabase
        .from('audiences_cache')
        .select('*')
        .eq('account_id', accountId)
        .gt('cached_at', cutoff)
        .order('cached_at', { ascending: false });

      if (cached && cached.length > 0) {
        return res.json({ data: cached.map((c) => c.data), source: 'cache' });
      }
    }

    // Fetch from Meta
    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.getCustomAudiences(accountId);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    const audiences = result.data.data || [];

    // Update cache
    if (supabase && audiences.length > 0) {
      // Clear old cache for this account
      await supabase
        .from('audiences_cache')
        .delete()
        .eq('account_id', accountId);

      const rows = audiences.map((a) => ({
        account_id: accountId,
        audience_id: a.id,
        name: a.name || null,
        type: 'CUSTOM',
        subtype: a.subtype || null,
        approximate_count: a.approximate_count || null,
        status: a.delivery_status ? a.delivery_status.status : null,
        data: a,
      }));

      const { error: cacheErr } = await supabase
        .from('audiences_cache')
        .insert(rows);

      if (cacheErr) {
        console.error('[audiences] Cache write error:', cacheErr.message);
      }
    }

    return res.json({ data: audiences, source: 'api' });
  } catch (err) {
    console.error('[audiences] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch audiences.' });
  }
});

// ── POST /audiences — Create custom audience ─────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { account_id, name, subtype, description, customer_file_source, rule, prefill, pixel_id, event_sources, retention_days } = req.body;

    if (!account_id || !name || !subtype) {
      return res.status(400).json({ error: 'Fields account_id, name, and subtype are required.' });
    }

    const params = { name, subtype };
    if (description) params.description = description;

    // Customer list type
    if (subtype === 'CUSTOM' && customer_file_source) {
      params.customer_file_source = customer_file_source;
    }

    // Pixel / website type
    if (subtype === 'WEBSITE') {
      if (!rule && !pixel_id) {
        return res.status(400).json({ error: 'Pixel-based audiences require rule or pixel_id.' });
      }
      if (rule) params.rule = typeof rule === 'string' ? rule : JSON.stringify(rule);
      if (pixel_id) params.pixel_id = pixel_id;
      if (retention_days) params.retention_days = retention_days;
      if (prefill !== undefined) params.prefill = prefill;
    }

    // Engagement type
    if (subtype === 'ENGAGEMENT') {
      if (rule) params.rule = typeof rule === 'string' ? rule : JSON.stringify(rule);
      if (event_sources) params.event_sources = event_sources;
      if (prefill !== undefined) params.prefill = prefill;
      if (retention_days) params.retention_days = retention_days;
    }

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.createCustomAudience(account_id, params);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[audiences] Error creating audience:', err.message);
    return res.status(500).json({ error: 'Failed to create audience.' });
  }
});

// ── POST /audiences/lookalike — Create lookalike audience ────────────────────
router.post('/lookalike', verifyToken, async (req, res) => {
  try {
    const { account_id, name, origin_audience_id, lookalike_spec } = req.body;

    if (!account_id || !name || !origin_audience_id || !lookalike_spec) {
      return res.status(400).json({
        error: 'Fields account_id, name, origin_audience_id, and lookalike_spec are required.',
      });
    }

    const params = {
      name,
      origin_audience_id,
      lookalike_spec: typeof lookalike_spec === 'string' ? lookalike_spec : JSON.stringify(lookalike_spec),
    };

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.createLookalikeAudience(account_id, params);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[audiences] Error creating lookalike:', err.message);
    return res.status(500).json({ error: 'Failed to create lookalike audience.' });
  }
});

// ── POST /audiences/overlap — Estimate audience overlap ──────────────────────
router.post('/overlap', verifyToken, async (req, res) => {
  try {
    const { audience_id_1, audience_id_2 } = req.body;

    if (!audience_id_1 || !audience_id_2) {
      return res.status(400).json({ error: 'Fields audience_id_1 and audience_id_2 are required.' });
    }

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.getAudienceOverlap(audience_id_1, audience_id_2);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: result.data });
  } catch (err) {
    console.error('[audiences] Error estimating overlap:', err.message);
    return res.status(500).json({ error: 'Failed to estimate audience overlap.' });
  }
});

module.exports = router;
