const { Router } = require('express');
const TikTokAPI = require('../../services/tiktok');
const { verifyToken } = require('../../middleware/auth');

const router = Router();

// ── GET /tiktok/campaigns/:advertiserId — List campaigns with ad groups + ads ─
router.get('/:advertiserId', verifyToken, async (req, res) => {
  try {
    const { advertiserId } = req.params;
    const tt = new TikTokAPI(req.user.tiktok_access_token);

    const campResult = await tt.getCampaigns(advertiserId);
    if (!campResult.success) {
      return res.status(campResult.error.status || 502).json({ error: campResult.error.message });
    }

    const campaigns = campResult.data?.list || [];

    const enriched = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const agResult = await tt.getAdGroups(advertiserId, {
            filtering: JSON.stringify({ campaign_ids: [campaign.campaign_id] }),
          });
          const adGroups = agResult.success ? (agResult.data?.list || []) : [];

          const adGroupsWithAds = await Promise.all(
            adGroups.map(async (ag) => {
              try {
                const adResult = await tt.getAds(advertiserId, {
                  filtering: JSON.stringify({ adgroup_ids: [ag.adgroup_id] }),
                });
                return { ...ag, ads: adResult.success ? (adResult.data?.list || []) : [] };
              } catch {
                return { ...ag, ads: [] };
              }
            })
          );

          return { ...campaign, ad_groups: adGroupsWithAds };
        } catch {
          return { ...campaign, ad_groups: [] };
        }
      })
    );

    return res.json({ data: enriched });
  } catch (err) {
    console.error('[tiktok/campaigns] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch TikTok campaigns.' });
  }
});

// ── POST /tiktok/campaigns — Create campaign ─────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { advertiser_id, campaign_name, objective_type, budget_mode, budget, operation_status } = req.body;

    if (!advertiser_id || !campaign_name || !objective_type) {
      return res.status(400).json({ error: 'Fields advertiser_id, campaign_name, and objective_type are required.' });
    }

    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.createCampaign(advertiser_id, {
      campaign_name,
      objective_type,
      budget_mode: budget_mode || 'BUDGET_MODE_DAY',
      budget: budget || 0,
      operation_status: operation_status || 'DISABLE',
    });

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[tiktok/campaigns] Create error:', err.message);
    return res.status(500).json({ error: 'Failed to create TikTok campaign.' });
  }
});

// ── PATCH /tiktok/campaigns/:campaignId — Update campaign ────────────────────
router.patch('/:campaignId', verifyToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { advertiser_id, campaign_name, budget, operation_status } = req.body;

    if (!advertiser_id) {
      return res.status(400).json({ error: 'advertiser_id is required.' });
    }

    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const params = { campaign_id: campaignId };
    if (campaign_name) params.campaign_name = campaign_name;
    if (budget !== undefined) params.budget = budget;
    if (operation_status) params.operation_status = operation_status;

    const result = await tt.updateCampaign(advertiser_id, params);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: { campaign_id: campaignId, ...params } });
  } catch (err) {
    console.error('[tiktok/campaigns] Update error:', err.message);
    return res.status(500).json({ error: 'Failed to update TikTok campaign.' });
  }
});

// ── DELETE /tiktok/campaigns/:campaignId — Delete (set DELETE status) ─────────
router.delete('/:campaignId', verifyToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { advertiser_id } = req.body;

    if (!advertiser_id) {
      return res.status(400).json({ error: 'advertiser_id is required.' });
    }

    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.updateCampaign(advertiser_id, {
      campaign_id: campaignId,
      operation_status: 'DELETE',
    });

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.json({ data: { campaign_id: campaignId, operation_status: 'DELETE' } });
  } catch (err) {
    console.error('[tiktok/campaigns] Delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete TikTok campaign.' });
  }
});

// ── POST /tiktok/adgroups — Create ad group ──────────────────────────────────
router.post('/adgroups', verifyToken, async (req, res) => {
  try {
    const { advertiser_id } = req.body;
    if (!advertiser_id) {
      return res.status(400).json({ error: 'advertiser_id is required.' });
    }

    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.createAdGroup(advertiser_id, req.body);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[tiktok/adgroups] Create error:', err.message);
    return res.status(500).json({ error: 'Failed to create TikTok ad group.' });
  }
});

// ── POST /tiktok/ads — Create ad ────────────────────────────────────────────
router.post('/ads', verifyToken, async (req, res) => {
  try {
    const { advertiser_id } = req.body;
    if (!advertiser_id) {
      return res.status(400).json({ error: 'advertiser_id is required.' });
    }

    const tt = new TikTokAPI(req.user.tiktok_access_token);
    const result = await tt.createAd(advertiser_id, req.body);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    return res.status(201).json({ data: result.data });
  } catch (err) {
    console.error('[tiktok/ads] Create error:', err.message);
    return res.status(500).json({ error: 'Failed to create TikTok ad.' });
  }
});

module.exports = router;
