const { Router } = require('express');
const MetaAPI = require('../services/meta');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// ── GET /campaigns/:accountId — List campaigns with nested adsets and ads ────
router.get('/campaigns/:accountId', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const meta = new MetaAPI(req.user.access_token);

    // Fetch campaigns
    const campResult = await meta.getCampaigns(accountId);
    if (!campResult.success) {
      return res.status(campResult.error.status || 502).json({ error: campResult.error.message });
    }

    const campaigns = campResult.data.data || [];

    // For each campaign, fetch adsets and ads in parallel
    const enriched = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const adsetResult = await meta.getAdSets(campaign.id);
          const adsets = adsetResult.success ? (adsetResult.data.data || []) : [];

          const adsetsWithAds = await Promise.all(
            adsets.map(async (adset) => {
              try {
                const adResult = await meta.getAds(adset.id);
                return { ...adset, ads: adResult.success ? (adResult.data.data || []) : [] };
              } catch {
                return { ...adset, ads: [] };
              }
            })
          );

          return { ...campaign, adsets: adsetsWithAds };
        } catch {
          return { ...campaign, adsets: [] };
        }
      })
    );

    return res.json({ data: enriched });
  } catch (err) {
    console.error('[campaigns] Error listing campaigns:', err.message);
    return res.status(500).json({ error: 'Failed to fetch campaigns.' });
  }
});

// ── POST /campaigns — Create campaign ────────────────────────────────────────
router.post('/campaigns', verifyToken, async (req, res) => {
  try {
    const { name, objective, account_id, status, daily_budget, lifetime_budget, special_ad_categories, start_time, stop_time } = req.body;

    if (!name || !objective || !account_id) {
      return res.status(400).json({ error: 'Fields name, objective, and account_id are required.' });
    }

    const params = { name, objective };
    if (status) params.status = status;
    if (daily_budget) params.daily_budget = daily_budget;
    if (lifetime_budget) params.lifetime_budget = lifetime_budget;
    if (special_ad_categories) params.special_ad_categories = special_ad_categories;
    if (start_time) params.start_time = start_time;
    if (stop_time) params.stop_time = stop_time;

    // Default special_ad_categories to empty array (required by Meta API)
    if (!params.special_ad_categories) {
      params.special_ad_categories = [];
    }

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.createCampaign(account_id, params);

    if (!result.success) {
      console.error('[campaigns] Meta API error:', JSON.stringify(result.error));
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[campaigns] Error creating campaign:', err.message);
    return res.status(500).json({ error: 'Failed to create campaign.' });
  }
});

// ── PATCH /campaigns/:id — Update campaign ───────────────────────────────────
router.patch('/campaigns/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['name', 'status', 'daily_budget', 'lifetime_budget', 'start_time', 'stop_time', 'bid_strategy'];
    const params = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) params[key] = req.body[key];
    }

    if (Object.keys(params).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.updateCampaign(id, params);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: { id, ...params, success: result.data.success } });
  } catch (err) {
    console.error('[campaigns] Error updating campaign:', err.message);
    return res.status(500).json({ error: 'Failed to update campaign.' });
  }
});

// ── DELETE /campaigns/:id — Archive (set status DELETED) ─────────────────────
router.delete('/campaigns/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.deleteCampaign(id);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: { id, status: 'DELETED' } });
  } catch (err) {
    console.error('[campaigns] Error deleting campaign:', err.message);
    return res.status(500).json({ error: 'Failed to delete campaign.' });
  }
});

// ── POST /adsets — Create ad set ─────────────────────────────────────────────
router.post('/adsets', verifyToken, async (req, res) => {
  try {
    const { account_id, campaign_id, name, targeting, billing_event, optimization_goal, daily_budget, lifetime_budget, bid_amount, start_time, end_time, status } = req.body;

    if (!account_id || !campaign_id || !name || !targeting || !billing_event || !optimization_goal) {
      return res.status(400).json({
        error: 'Fields account_id, campaign_id, name, targeting, billing_event, and optimization_goal are required.',
      });
    }

    if (!daily_budget && !lifetime_budget) {
      return res.status(400).json({ error: 'Either daily_budget or lifetime_budget is required.' });
    }

    const params = {
      campaign_id,
      name,
      targeting: typeof targeting === 'string' ? targeting : JSON.stringify(targeting),
      billing_event,
      optimization_goal,
    };

    if (daily_budget) params.daily_budget = daily_budget;
    if (lifetime_budget) params.lifetime_budget = lifetime_budget;
    if (bid_amount) params.bid_amount = bid_amount;
    if (start_time) params.start_time = start_time;
    if (end_time) params.end_time = end_time;
    if (status) params.status = status;

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.createAdSet(account_id, params);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[adsets] Error creating ad set:', err.message);
    return res.status(500).json({ error: 'Failed to create ad set.' });
  }
});

// ── PATCH /adsets/:id — Update ad set ────────────────────────────────────────
router.patch('/adsets/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['name', 'status', 'daily_budget', 'lifetime_budget', 'bid_amount', 'targeting', 'start_time', 'end_time', 'optimization_goal'];
    const params = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        params[key] = key === 'targeting' && typeof req.body[key] === 'object'
          ? JSON.stringify(req.body[key])
          : req.body[key];
      }
    }

    if (Object.keys(params).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.updateAdSet(id, params);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: { id, ...params, success: result.data.success } });
  } catch (err) {
    console.error('[adsets] Error updating ad set:', err.message);
    return res.status(500).json({ error: 'Failed to update ad set.' });
  }
});

// ── POST /ads — Create ad ───────────────────────────────────────────────────
router.post('/ads', verifyToken, async (req, res) => {
  try {
    const { account_id, adset_id, name, creative, status } = req.body;

    if (!account_id || !adset_id || !name || !creative) {
      return res.status(400).json({
        error: 'Fields account_id, adset_id, name, and creative are required.',
      });
    }

    const params = {
      adset_id,
      name,
      creative: typeof creative === 'string' ? creative : JSON.stringify(creative),
    };
    if (status) params.status = status;

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.createAd(account_id, params);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[ads] Error creating ad:', err.message);
    return res.status(500).json({ error: 'Failed to create ad.' });
  }
});

// ── PATCH /ads/:id — Update ad ──────────────────────────────────────────────
router.patch('/ads/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['name', 'status', 'creative'];
    const params = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        params[key] = key === 'creative' && typeof req.body[key] === 'object'
          ? JSON.stringify(req.body[key])
          : req.body[key];
      }
    }

    if (Object.keys(params).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const meta = new MetaAPI(req.user.access_token);
    const result = await meta.updateAd(id, params);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: { id, ...params, success: result.data.success } });
  } catch (err) {
    console.error('[ads] Error updating ad:', err.message);
    return res.status(500).json({ error: 'Failed to update ad.' });
  }
});

// ── POST /campaigns/draft — Save draft campaign config ───────────────────────
router.post('/campaigns/draft', verifyToken, async (req, res) => {
  try {
    const { account_id, name, config } = req.body;

    if (!account_id || !name || !config) {
      return res.status(400).json({ error: 'Fields account_id, name, and config are required.' });
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { data, error } = await supabase
      .from('draft_campaigns')
      .insert({
        user_id: req.user.id,
        account_id,
        name,
        config,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('[drafts] Insert error:', error.message);
      return res.status(500).json({ error: 'Failed to save draft.' });
    }

    return res.status(201).json({ data });
  } catch (err) {
    console.error('[drafts] Error saving draft:', err.message);
    return res.status(500).json({ error: 'Failed to save draft.' });
  }
});

// ── GET /campaigns/drafts/:accountId — List drafts ───────────────────────────
router.get('/campaigns/drafts/:accountId', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { data, error } = await supabase
      .from('draft_campaigns')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('account_id', accountId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[drafts] Fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch drafts.' });
    }

    return res.json({ data: data || [] });
  } catch (err) {
    console.error('[drafts] Error fetching drafts:', err.message);
    return res.status(500).json({ error: 'Failed to fetch drafts.' });
  }
});

// ── DELETE /campaigns/draft/:id — Delete draft ───────────────────────────────
router.delete('/campaigns/draft/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { error } = await supabase
      .from('draft_campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('[drafts] Delete error:', error.message);
      return res.status(500).json({ error: 'Failed to delete draft.' });
    }

    return res.json({ data: { deleted: true } });
  } catch (err) {
    console.error('[drafts] Error deleting draft:', err.message);
    return res.status(500).json({ error: 'Failed to delete draft.' });
  }
});

module.exports = router;
