const { Router } = require('express');
const MetaAPI = require('../services/meta');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// ── GET /accounts — List ad accounts ─────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.getAdAccounts();

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    const accounts = result.data.data || [];

    // Upsert account metadata to Supabase for caching / reference
    if (supabase && accounts.length > 0) {
      const rows = accounts.map((a) => ({
        user_id: req.user.id,
        account_id: a.account_id || a.id,
        name: a.name || null,
        currency: a.currency || null,
        timezone: a.timezone_name || null,
        spend_cap: a.spend_cap ? parseFloat(a.spend_cap) : null,
        status: a.account_status || null,
        business_id: a.business ? a.business.id : null,
      }));

      const { error: upsertErr } = await supabase
        .from('ad_accounts')
        .upsert(rows, { onConflict: 'user_id,account_id' });

      if (upsertErr) {
        console.error('[accounts] Supabase upsert error:', upsertErr.message);
      }
    }

    return res.json({ data: accounts });
  } catch (err) {
    console.error('[accounts] Error fetching accounts:', err.message);
    return res.status(500).json({ error: 'Failed to fetch ad accounts.' });
  }
});

// ── GET /accounts/:id — Single account details ──────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const meta = new MetaAPI(req.user.access_token);

    const result = await meta.request(
      `/${id}?fields=account_id,name,currency,timezone_name,spend_cap,account_status,business,amount_spent,balance,owner,funding_source_details`
    );

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: result.data });
  } catch (err) {
    console.error('[accounts] Error fetching account:', err.message);
    return res.status(500).json({ error: 'Failed to fetch account details.' });
  }
});

module.exports = router;
