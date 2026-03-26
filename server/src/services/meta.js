const fetch = require('node-fetch');

const ERROR_MESSAGES = {
  17: 'Meta API rate limit reached. Please wait a moment and try again.',
  32: 'Meta API rate limit reached (account level). Please try again shortly.',
  190: 'Your Meta access token is invalid or has expired. Please re-authenticate.',
  1487851: 'This action was rejected by Meta advertising policies. Please review your content.',
  2: 'Meta API is temporarily unavailable. Please try again later.',
  4: 'Meta API call limit reached. Please try again in a few minutes.',
  100: 'Invalid parameter sent to Meta API.',
  200: 'Insufficient permissions. Please check your app permissions.',
};

class MetaAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.BASE_URL = 'https://graph.facebook.com/v19.0';
  }

  async request(endpoint, method = 'GET', body = null) {
    const url = new URL(`${this.BASE_URL}${endpoint}`);

    // Append access_token for GET requests as query param
    if (method === 'GET') {
      url.searchParams.set('access_token', this.accessToken);
    }

    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body && method !== 'GET') {
      // Always include access_token in body for non-GET
      const payload = { ...body, access_token: this.accessToken };
      options.body = JSON.stringify(payload);
    }

    try {
      const response = await fetch(url.toString(), options);
      const data = await response.json();

      if (data.error) {
        const code = data.error.code;
        const humanMessage = ERROR_MESSAGES[code] || data.error.message;

        // Determine appropriate HTTP-like status
        let status = 400;
        if (code === 17 || code === 32 || code === 4) status = 429;
        else if (code === 190 || code === 200) status = 401;
        else if (code === 1487851) status = 403;
        else if (code === 2) status = 503;

        return {
          success: false,
          error: {
            message: humanMessage,
            meta_code: code,
            meta_subcode: data.error.error_subcode || null,
            meta_type: data.error.type || null,
            status,
          },
          data: null,
        };
      }

      return { success: true, data, error: null };
    } catch (err) {
      return {
        success: false,
        error: {
          message: `Network error communicating with Meta API: ${err.message}`,
          meta_code: null,
          status: 502,
        },
        data: null,
      };
    }
  }

  // ── Ad Accounts ──────────────────────────────────────────

  async getAdAccounts() {
    return this.request(
      '/me/adaccounts?fields=account_id,name,currency,timezone_name,spend_cap,account_status,business'
    );
  }

  // ── Campaigns ────────────────────────────────────────────

  async getCampaigns(accountId, fields) {
    const f = fields || 'id,name,objective,status,daily_budget,lifetime_budget,budget_remaining,start_time,stop_time,created_time,updated_time';
    return this.request(`/${accountId}/campaigns?fields=${f}&limit=500`);
  }

  async createCampaign(accountId, params) {
    return this.request(`/${accountId}/campaigns`, 'POST', params);
  }

  async updateCampaign(campaignId, params) {
    return this.request(`/${campaignId}`, 'POST', params);
  }

  async deleteCampaign(campaignId) {
    return this.request(`/${campaignId}`, 'POST', { status: 'DELETED' });
  }

  // ── Ad Sets ──────────────────────────────────────────────

  async getAdSets(campaignId, fields) {
    const f = fields || 'id,name,status,daily_budget,lifetime_budget,targeting,billing_event,optimization_goal,bid_amount,start_time,end_time,created_time';
    return this.request(`/${campaignId}/adsets?fields=${f}&limit=500`);
  }

  async createAdSet(accountId, params) {
    return this.request(`/${accountId}/adsets`, 'POST', params);
  }

  async updateAdSet(adSetId, params) {
    return this.request(`/${adSetId}`, 'POST', params);
  }

  // ── Ads ──────────────────────────────────────────────────

  async getAds(adSetId, fields) {
    const f = fields || 'id,name,status,creative,created_time,updated_time';
    return this.request(`/${adSetId}/ads?fields=${f}&limit=500`);
  }

  async createAd(accountId, params) {
    return this.request(`/${accountId}/ads`, 'POST', params);
  }

  async updateAd(adId, params) {
    return this.request(`/${adId}`, 'POST', params);
  }

  // ── Insights ─────────────────────────────────────────────

  async getInsights(objectId, params = {}) {
    const qs = new URLSearchParams();
    if (params.fields) qs.set('fields', params.fields);
    if (params.breakdowns) qs.set('breakdowns', params.breakdowns);
    if (params.date_preset) qs.set('date_preset', params.date_preset);
    if (params.time_range) qs.set('time_range', JSON.stringify(params.time_range));
    if (params.level) qs.set('level', params.level);
    if (params.limit) qs.set('limit', params.limit);
    qs.set('time_increment', params.time_increment || '1');

    return this.request(`/${objectId}/insights?${qs.toString()}`);
  }

  // ── Audiences ────────────────────────────────────────────

  async getCustomAudiences(accountId) {
    return this.request(
      `/${accountId}/customaudiences?fields=id,name,subtype,approximate_count,delivery_status,operation_status,time_created,time_updated&limit=500`
    );
  }

  async createCustomAudience(accountId, params) {
    return this.request(`/${accountId}/customaudiences`, 'POST', params);
  }

  async createLookalikeAudience(accountId, params) {
    return this.request(`/${accountId}/customaudiences`, 'POST', {
      subtype: 'LOOKALIKE',
      ...params,
    });
  }

  async getAudienceOverlap(audienceId1, audienceId2) {
    // Uses the delivery_estimate endpoint to get audience overlap information
    return this.request(
      `/${audienceId1}/delivery_estimate?targeting_spec=${encodeURIComponent(
        JSON.stringify({ custom_audiences: [{ id: audienceId2 }] })
      )}&optimization_goal=REACH`
    );
  }

  // ── Pixels ───────────────────────────────────────────────

  async getPixels(accountId) {
    return this.request(
      `/${accountId}/adspixels?fields=id,name,code,creation_time,is_unavailable,last_fired_time,owner_ad_account`
    );
  }

  async getPixelStats(pixelId) {
    return this.request(
      `/${pixelId}/stats?aggregation=event&start_time=${Math.floor(Date.now() / 1000) - 86400 * 7}`
    );
  }

  async getPixelEvents(pixelId) {
    return this.request(
      `/${pixelId}/recent_events?fields=event_name,event_time,event_count`
    );
  }

  // ── Creative / Media ─────────────────────────────────────

  async uploadImage(accountId, imageBuffer) {
    const FormData = require('form-data') || null;
    // For image upload we need multipart form
    const formData = new (require('node-fetch').FormData || (() => {
      // Fallback: encode as base64 and use bytes parameter
      return null;
    }))();

    // Use the bytes approach which is simpler
    const base64 = imageBuffer.toString('base64');
    return this.request(`/${accountId}/adimages`, 'POST', {
      bytes: base64,
    });
  }

  async uploadVideo(accountId, videoBuffer) {
    // Video upload uses a chunked upload protocol.
    // For simplicity, use the small-file approach (< 1GB):
    const base64 = videoBuffer.toString('base64');
    return this.request(`/${accountId}/advideos`, 'POST', {
      source: base64,
    });
  }
}

module.exports = MetaAPI;
