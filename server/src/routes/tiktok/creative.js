const { Router } = require('express');
const TikTokAPI = require('../../services/tiktok');
const { verifyToken } = require('../../middleware/auth');

const router = Router();

// ── GET /tiktok/creative/:advertiserId — List creative assets ────────────────
router.get('/:advertiserId', verifyToken, async (req, res) => {
  try {
    const { advertiserId } = req.params;
    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.getCreatives(advertiserId);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: result.data?.list || result.data || [] });
  } catch (err) {
    console.error('[tiktok/creative] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch TikTok creative.' });
  }
});

// ── POST /tiktok/creative/upload/image — Upload image ────────────────────────
router.post('/upload/image', verifyToken, async (req, res) => {
  try {
    const { advertiser_id, image_url } = req.body;
    if (!advertiser_id || !image_url) {
      return res.status(400).json({ error: 'advertiser_id and image_url are required.' });
    }

    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.uploadImage(advertiser_id, image_url);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[tiktok/creative] Upload image error:', err.message);
    return res.status(500).json({ error: 'Failed to upload image to TikTok.' });
  }
});

// ── POST /tiktok/creative/upload/video — Upload video ────────────────────────
router.post('/upload/video', verifyToken, async (req, res) => {
  try {
    const { advertiser_id, video_url } = req.body;
    if (!advertiser_id || !video_url) {
      return res.status(400).json({ error: 'advertiser_id and video_url are required.' });
    }

    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.uploadVideo(advertiser_id, video_url);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[tiktok/creative] Upload video error:', err.message);
    return res.status(500).json({ error: 'Failed to upload video to TikTok.' });
  }
});

module.exports = router;
