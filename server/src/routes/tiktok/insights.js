const { Router } = require('express');
const TikTokAPI = require('../../services/tiktok');
const { verifyToken } = require('../../middleware/auth');

const router = Router();

// ── GET /tiktok/insights/:advertiserId — Get reporting data ──────────────────
router.get('/:advertiserId', verifyToken, async (req, res) => {
  try {
    const { advertiserId } = req.params;
    const { start_date, end_date, data_level, dimensions, metrics } = req.query;

    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.getInsights(advertiserId, {
      start_date: start_date || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      end_date: end_date || new Date().toISOString().split('T')[0],
      data_level: data_level || 'AUCTION_CAMPAIGN',
      dimensions: dimensions || '["campaign_id"]',
      metrics: metrics || '["spend","impressions","clicks","conversion","cost_per_conversion","cpc","cpm","ctr"]',
    });

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: result.data });
  } catch (err) {
    console.error('[tiktok/insights] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch TikTok insights.' });
  }
});

module.exports = router;
