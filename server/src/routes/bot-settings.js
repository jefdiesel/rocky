const { Router } = require('express');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');
const { encrypt, decrypt } = require('../services/crypto');

const router = Router();

// ── GET /bot/config — Get bot configuration ──────────────────────────────────
router.get('/config', verifyToken, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });

    const { data, error } = await supabase
      .from('bot_config')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const config = data || { telegram_token: null, telegram_chat_id: null, redtrack_api_key: null, roi_threshold: 25 };
    return res.json({
      data: {
        telegram_token_set: !!config.telegram_token,
        telegram_chat_id: config.telegram_chat_id || '',
        redtrack_api_key_set: !!config.redtrack_api_key,
        roi_threshold: config.roi_threshold || 25,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── PUT /bot/config — Save bot configuration ─────────────────────────────────
router.put('/config', verifyToken, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });

    const { telegram_token, telegram_chat_id, redtrack_api_key, roi_threshold } = req.body;

    const row = {
      user_id: req.user.id,
      updated_at: new Date().toISOString(),
    };
    if (telegram_token) row.telegram_token = encrypt(telegram_token);
    if (telegram_chat_id !== undefined) row.telegram_chat_id = telegram_chat_id;
    if (redtrack_api_key) row.redtrack_api_key = encrypt(redtrack_api_key);
    if (roi_threshold !== undefined) row.roi_threshold = roi_threshold;

    const { data, error } = await supabase
      .from('bot_config')
      .upsert(row, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: { saved: true } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /bot/alerts — Alert history ──────────────────────────────────────────
router.get('/alerts', verifyToken, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });

    const { data, error } = await supabase
      .from('alert_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /bot/snooze — Snooze states ──────────────────────────────────────────
router.get('/snooze', verifyToken, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });

    // Clean expired snoozes
    await supabase.from('snooze_state').delete().lt('snoozed_until', new Date().toISOString());

    const { data, error } = await supabase
      .from('snooze_state')
      .select('*')
      .order('snoozed_until', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /bot/snooze/:campaignId — Cancel snooze ───────────────────────────
router.delete('/snooze/:campaignId', verifyToken, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database unavailable.' });
    const { error } = await supabase.from('snooze_state').delete().eq('campaign_id', req.params.campaignId);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: { deleted: true } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
