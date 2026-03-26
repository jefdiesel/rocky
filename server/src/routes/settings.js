const { Router } = require('express');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// ── GET /settings — Fetch user preferences ─────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('[settings] Fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to load preferences.' });
    }

    return res.json({ data: data?.preferences || {} });
  } catch (err) {
    console.error('[settings] Error:', err.message);
    return res.status(500).json({ error: 'Internal error loading preferences.' });
  }
});

// ── PUT /settings — Save user preferences ──────────────────────────────────
router.put('/', verifyToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const preferences = req.body;
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Invalid preferences payload.' });
    }

    // Merge with existing preferences so partial updates work
    const { data: existing } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', req.user.id)
      .single();

    const merged = { ...(existing?.preferences || {}), ...preferences };

    const { error } = await supabase
      .from('users')
      .update({ preferences: merged, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (error) {
      console.error('[settings] Save error:', error.message);
      return res.status(500).json({ error: 'Failed to save preferences.' });
    }

    return res.json({ data: merged });
  } catch (err) {
    console.error('[settings] Error:', err.message);
    return res.status(500).json({ error: 'Internal error saving preferences.' });
  }
});

module.exports = router;
