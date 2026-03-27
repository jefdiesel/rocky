const { Router } = require('express');
const TikTokAPI = require('../../services/tiktok');
const { verifyToken } = require('../../middleware/auth');

const router = Router();

// ── GET /tiktok/accounts — List advertiser accounts ───────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.getAdvertiserAccounts();

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: result.data?.list || result.data || [] });
  } catch (err) {
    console.error('[tiktok/accounts] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch TikTok accounts.' });
  }
});

module.exports = router;
