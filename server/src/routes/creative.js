const { Router } = require('express');
const multer = require('multer');
const MetaAPI = require('../services/meta');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// Configure multer for in-memory storage (files passed directly to Meta API)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowedImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideo = ['video/mp4', 'video/quicktime', 'video/avi', 'video/mov'];
    const allowed = [...allowedImage, ...allowedVideo];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ── POST /creative/upload/image — Upload image to Meta ───────────────────────
router.post('/upload/image', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided. Use form field "file".' });
    }

    const { account_id } = req.body;
    if (!account_id) {
      return res.status(400).json({ error: 'Field account_id is required.' });
    }

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.uploadImage(account_id, req.file.buffer);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    // Extract image data from Meta response
    const images = result.data.images || {};
    const imageKey = Object.keys(images)[0];
    const imageData = images[imageKey] || {};

    // Store metadata in Supabase
    let assetRow = null;
    if (supabase) {
      const { data: row, error: insertErr } = await supabase
        .from('creative_assets')
        .insert({
          account_id,
          user_id: req.user.id,
          meta_asset_id: imageData.hash || null,
          type: 'image',
          url: imageData.url || null,
          dimensions: req.body.dimensions || null,
          file_size: req.file.size,
          approval_status: 'PENDING',
          metadata: {
            name: req.file.originalname,
            mimetype: req.file.mimetype,
            hash: imageData.hash || null,
          },
        })
        .select()
        .single();

      if (insertErr) {
        console.error('[creative] DB insert error:', insertErr.message);
      } else {
        assetRow = row;
      }
    }

    return res.status(201).json({
      data: {
        id: assetRow ? assetRow.id : null,
        meta_asset_id: imageData.hash || null,
        url: imageData.url || null,
        type: 'image',
      },
    });
  } catch (err) {
    console.error('[creative] Image upload error:', err.message);
    return res.status(500).json({ error: 'Failed to upload image.' });
  }
});

// ── POST /creative/upload/video — Upload video to Meta ───────────────────────
router.post('/upload/video', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided. Use form field "file".' });
    }

    const { account_id } = req.body;
    if (!account_id) {
      return res.status(400).json({ error: 'Field account_id is required.' });
    }

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.uploadVideo(account_id, req.file.buffer);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    const videoId = result.data.id || null;

    // Store metadata in Supabase
    let assetRow = null;
    if (supabase) {
      const { data: row, error: insertErr } = await supabase
        .from('creative_assets')
        .insert({
          account_id,
          user_id: req.user.id,
          meta_asset_id: videoId,
          type: 'video',
          url: null, // Video URL available after processing
          dimensions: req.body.dimensions || null,
          file_size: req.file.size,
          approval_status: 'PENDING',
          metadata: {
            name: req.file.originalname,
            mimetype: req.file.mimetype,
            video_id: videoId,
          },
        })
        .select()
        .single();

      if (insertErr) {
        console.error('[creative] DB insert error:', insertErr.message);
      } else {
        assetRow = row;
      }
    }

    return res.status(201).json({
      data: {
        id: assetRow ? assetRow.id : null,
        meta_asset_id: videoId,
        type: 'video',
      },
    });
  } catch (err) {
    console.error('[creative] Video upload error:', err.message);
    return res.status(500).json({ error: 'Failed to upload video.' });
  }
});

// ── GET /creative/:accountId — List creative assets ──────────────────────────
router.get('/:accountId', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { data, error } = await supabase
      .from('creative_assets')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[creative] Fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch creative assets.' });
    }

    return res.json({ data: data || [] });
  } catch (err) {
    console.error('[creative] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch creative assets.' });
  }
});

// ── DELETE /creative/:id — Remove from local library ─────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { error } = await supabase
      .from('creative_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('[creative] Delete error:', error.message);
      return res.status(500).json({ error: 'Failed to delete creative asset.' });
    }

    return res.json({ data: { deleted: true } });
  } catch (err) {
    console.error('[creative] Error deleting:', err.message);
    return res.status(500).json({ error: 'Failed to delete creative asset.' });
  }
});

module.exports = router;
