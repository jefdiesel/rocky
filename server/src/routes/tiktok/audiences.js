const { Router } = require('express');
const TikTokAPI = require('../../services/tiktok');
const { verifyToken } = require('../../middleware/auth');

const router = Router();

// ── GET /tiktok/audiences/:advertiserId — List audiences ─────────────────────
router.get('/:advertiserId', verifyToken, async (req, res) => {
  try {
    const { advertiserId } = req.params;
    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.getAudiences(advertiserId);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: result.data?.list || result.data || [] });
  } catch (err) {
    console.error('[tiktok/audiences] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch TikTok audiences.' });
  }
});

// ── POST /tiktok/audiences — Create audience ─────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { advertiser_id } = req.body;
    if (!advertiser_id) {
      return res.status(400).json({ error: 'advertiser_id is required.' });
    }

    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.createAudience(advertiser_id, req.body);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[tiktok/audiences] Create error:', err.message);
    return res.status(500).json({ error: 'Failed to create TikTok audience.' });
  }
});

module.exports = router;
