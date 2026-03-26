const { Router } = require('express');
const MetaAPI = require('../services/meta');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// ── GET /pixels/:accountId — List pixels with status ─────────────────────────
router.get('/:accountId', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.getPixels(accountId);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: result.data.data || [] });
  } catch (err) {
    console.error('[pixels] Error listing pixels:', err.message);
    return res.status(500).json({ error: 'Failed to fetch pixels.' });
  }
});

// ── GET /pixels/:id/stats — Event counts and match rates ────────────────────
router.get('/:id/stats', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.getPixelStats(id);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: result.data.data || result.data });
  } catch (err) {
    console.error('[pixels] Error fetching pixel stats:', err.message);
    return res.status(500).json({ error: 'Failed to fetch pixel stats.' });
  }
});

// ── GET /pixels/:id/events — Recent events stream ───────────────────────────
router.get('/:id/events', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.getPixelEvents(id);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: result.data.data || [] });
  } catch (err) {
    console.error('[pixels] Error fetching pixel events:', err.message);
    return res.status(500).json({ error: 'Failed to fetch pixel events.' });
  }
});

module.exports = router;
