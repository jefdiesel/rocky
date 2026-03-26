const { Router } = require('express');
const MetaAPI = require('../services/meta');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ── GET /insights/:accountId — Fetch insights with caching ───────────────────
router.get('/:accountId', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const {
      level = 'campaign',
      fields = 'spend,impressions,clicks,ctr,cpm,cpc,reach,frequency,actions,cost_per_action_type,purchase_roas',
      breakdowns,
      date_preset,
      time_range,
      time_increment,
    } = req.query;

    // Build a cache key from the query params
    const cacheKey = JSON.stringify({ accountId, level, fields, breakdowns, date_preset, time_range });

    // Check Supabase cache
    if (supabase) {
      const { data: cached } = await supabase
        .from('insights_cache')
        .select('metrics, cached_at, expires_at')
        .eq('object_id', accountId)
        .eq('level', level)
        .eq('breakdowns', breakdowns || '')
        .gt('expires_at', new Date().toISOString())
        .order('cached_at', { ascending: false })
        .limit(1)
        .single();

      if (cached) {
        return res.json({ data: cached.metrics, source: 'cache', cached_at: cached.cached_at });
      }
    }

    // Fetch from Meta API
    const meta = new MetaAPI(req.user.access_token);
    const params = { fields, level };
    if (breakdowns) params.breakdowns = breakdowns;
    if (date_preset) params.date_preset = date_preset;
    if (time_range) {
      try {
        params.time_range = typeof time_range === 'string' ? JSON.parse(time_range) : time_range;
      } catch {
        return res.status(400).json({ error: 'Invalid time_range format. Expected JSON object with since and until.' });
      }
    }
    if (time_increment) params.time_increment = time_increment;

    const result = await meta.getInsights(accountId, params);

    if (!result.success) {
      return res.status(result.error.status || 502).json({ error: result.error.message });
    }

    const insights = result.data.data || [];

    // Store in cache
    if (supabase && insights.length > 0) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

      const { error: cacheErr } = await supabase.from('insights_cache').insert({
        account_id: accountId,
        object_id: accountId,
        object_type: 'account',
        level,
        breakdowns: breakdowns || '',
        metrics: insights,
        cached_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      if (cacheErr) {
        console.error('[insights] Cache write error:', cacheErr.message);
      }
    }

    return res.json({ data: insights, source: 'api' });
  } catch (err) {
    console.error('[insights] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch insights.' });
  }
});

// ── GET /insights/:accountId/pacing — Budget pacing analysis ─────────────────
router.get('/:accountId/pacing', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const meta = new MetaAPI(req.user.access_token);

    // Fetch active campaigns
    const campResult = await meta.getCampaigns(
      accountId,
      'id,name,status,daily_budget,lifetime_budget,budget_remaining,start_time,stop_time'
    );

    if (!campResult.success) {
      return res.status(campResult.error.status || 502).json({ error: campResult.error.message });
    }

    const campaigns = (campResult.data.data || []).filter(
      (c) => c.status === 'ACTIVE'
    );

    const now = new Date();
    const pacing = [];

    for (const campaign of campaigns) {
      const startDate = campaign.start_time ? new Date(campaign.start_time) : null;
      const endDate = campaign.stop_time ? new Date(campaign.stop_time) : null;

      // Fetch spend insights for the campaign's flight
      const insightParams = {
        fields: 'spend',
        level: 'campaign',
      };

      if (startDate && endDate) {
        insightParams.time_range = {
          since: startDate.toISOString().slice(0, 10),
          until: now.toISOString().slice(0, 10),
        };
      } else {
        insightParams.date_preset = 'maximum';
      }

      const insightResult = await meta.getInsights(campaign.id, insightParams);
      const totalSpend = insightResult.success
        ? (insightResult.data.data || []).reduce(
            (sum, row) => sum + parseFloat(row.spend || 0),
            0
          )
        : 0;

      let daysElapsed = 0;
      let daysRemaining = 0;
      let totalDays = 0;

      if (startDate && endDate) {
        totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        daysElapsed = Math.max(0, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
        daysRemaining = Math.max(0, totalDays - daysElapsed);
      }

      const dailyBudget = campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : 0;
      const lifetimeBudget = campaign.lifetime_budget ? parseFloat(campaign.lifetime_budget) / 100 : 0;

      const targetBudget = lifetimeBudget || dailyBudget * totalDays;
      const proRatedBudget = lifetimeBudget
        ? (lifetimeBudget / totalDays) * daysElapsed
        : dailyBudget * daysElapsed;

      const projectedSpend = daysElapsed > 0
        ? (totalSpend / daysElapsed) * totalDays
        : 0;

      let pace = 'on_track';
      if (proRatedBudget > 0) {
        const ratio = totalSpend / proRatedBudget;
        if (ratio < 0.85) pace = 'underspending';
        else if (ratio > 1.15) pace = 'overspending';
      }

      pacing.push({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        daily_budget: dailyBudget,
        lifetime_budget: lifetimeBudget || null,
        total_days: totalDays,
        days_elapsed: daysElapsed,
        days_remaining: daysRemaining,
        total_spend: Math.round(totalSpend * 100) / 100,
        pro_rated_budget: Math.round(proRatedBudget * 100) / 100,
        projected_spend: Math.round(projectedSpend * 100) / 100,
        target_budget: Math.round(targetBudget * 100) / 100,
        pace,
      });
    }

    return res.json({ data: pacing });
  } catch (err) {
    console.error('[insights/pacing] Error:', err.message);
    return res.status(500).json({ error: 'Failed to compute pacing.' });
  }
});

module.exports = router;
