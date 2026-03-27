const fetch = require('node-fetch');

const RETRY_DELAYS = [1000, 2000, 4000];
const BASE_URL = 'https://business-api.tiktok.com/open_api/v1.3';

class TikTokAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async requestWithRetry(endpoint, method = 'GET', body = null) {
    let lastResult;
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      lastResult = await this.request(endpoint, method, body);
      if (lastResult.success) return lastResult;
      const status = lastResult.error?.status;
      if (status !== 429 && status !== 503) break;
      if (attempt === RETRY_DELAYS.length) break;
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }
    return lastResult;
  }

  async request(endpoint, method = 'GET', body = null) {
    const url = new URL(`${BASE_URL}${endpoint}`);

    const options = {
      method,
      headers: {
        'Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    if (body && method === 'GET') {
      for (const [key, value] of Object.entries(body)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      }
    }

    try {
      const response = await fetch(url.toString(), options);
      const data = await response.json();

      if (data.code !== 0) {
        let status = 400;
        if (data.code === 40100) status = 401;
        else if (data.code === 40001 || data.code === 40002) status = 429;
        else if (data.code === 50000) status = 503;
        else if (data.code === 40300) status = 403;

        return {
          success: false,
          error: {
            message: data.message || 'TikTok API error',
            tiktok_code: data.code,
            request_id: data.request_id || null,
            status,
          },
          data: null,
        };
      }

      return { success: true, data: data.data, error: null };
    } catch (err) {
      return {
        success: false,
        error: {
          message: `Network error communicating with TikTok API: ${err.message}`,
          tiktok_code: null,
          status: 502,
        },
        data: null,
      };
    }
  }

  // ── Advertiser Accounts ────────────────────────────────

  async getAdvertiserAccounts() {
    return this.requestWithRetry('/oauth2/advertiser/get/');
  }

  // ── Campaigns ──────────────────────────────────────────

  async getCampaigns(advertiserId, params = {}) {
    return this.requestWithRetry('/campaign/get/', 'GET', {
      advertiser_id: advertiserId,
      page_size: params.page_size || 100,
      page: params.page || 1,
      ...params,
    });
  }

  async createCampaign(advertiserId, params) {
    return this.requestWithRetry('/campaign/create/', 'POST', {
      advertiser_id: advertiserId,
      ...params,
    });
  }

  async updateCampaign(advertiserId, params) {
    return this.requestWithRetry('/campaign/update/', 'POST', {
      advertiser_id: advertiserId,
      ...params,
    });
  }

  // ── Ad Groups ──────────────────────────────────────────

  async getAdGroups(advertiserId, params = {}) {
    return this.requestWithRetry('/adgroup/get/', 'GET', {
      advertiser_id: advertiserId,
      page_size: params.page_size || 100,
      page: params.page || 1,
      ...params,
    });
  }

  async createAdGroup(advertiserId, params) {
    return this.requestWithRetry('/adgroup/create/', 'POST', {
      advertiser_id: advertiserId,
      ...params,
    });
  }

  async updateAdGroup(advertiserId, params) {
    return this.requestWithRetry('/adgroup/update/', 'POST', {
      advertiser_id: advertiserId,
      ...params,
    });
  }

  // ── Ads ────────────────────────────────────────────────

  async getAds(advertiserId, params = {}) {
    return this.requestWithRetry('/ad/get/', 'GET', {
      advertiser_id: advertiserId,
      page_size: params.page_size || 100,
      page: params.page || 1,
      ...params,
    });
  }

  async createAd(advertiserId, params) {
    return this.requestWithRetry('/ad/create/', 'POST', {
      advertiser_id: advertiserId,
      ...params,
    });
  }

  async updateAd(advertiserId, params) {
    return this.requestWithRetry('/ad/update/', 'POST', {
      advertiser_id: advertiserId,
      ...params,
    });
  }

  // ── Insights / Reporting ───────────────────────────────

  async getInsights(advertiserId, params = {}) {
    return this.requestWithRetry('/report/integrated/get/', 'GET', {
      advertiser_id: advertiserId,
      report_type: params.report_type || 'BASIC',
      data_level: params.data_level || 'AUCTION_CAMPAIGN',
      dimensions: params.dimensions || '["campaign_id"]',
      metrics: params.metrics || '["spend","impressions","clicks","conversion","cost_per_conversion","cpc","cpm","ctr"]',
      start_date: params.start_date,
      end_date: params.end_date,
      page_size: params.page_size || 100,
      page: params.page || 1,
    });
  }

  // ── Audiences ──────────────────────────────────────────

  async getAudiences(advertiserId, params = {}) {
    return this.requestWithRetry('/dmp/custom_audience/list/', 'GET', {
      advertiser_id: advertiserId,
      page_size: params.page_size || 100,
      page: params.page || 1,
    });
  }

  async createAudience(advertiserId, params) {
    return this.requestWithRetry('/dmp/custom_audience/create/', 'POST', {
      advertiser_id: advertiserId,
      ...params,
    });
  }

  // ── Pixels ─────────────────────────────────────────────

  async getPixels(advertiserId) {
    return this.requestWithRetry('/pixel/list/', 'GET', {
      advertiser_id: advertiserId,
    });
  }

  // ── Creative ───────────────────────────────────────────

  async getCreatives(advertiserId, params = {}) {
    return this.requestWithRetry('/creative/assets/get/', 'GET', {
      advertiser_id: advertiserId,
      page_size: params.page_size || 100,
      page: params.page || 1,
    });
  }

  async uploadImage(advertiserId, imageUrl) {
    return this.requestWithRetry('/file/image/ad/upload/', 'POST', {
      advertiser_id: advertiserId,
      upload_type: 'UPLOAD_BY_URL',
      image_url: imageUrl,
    });
  }

  async uploadVideo(advertiserId, videoUrl) {
    return this.requestWithRetry('/file/video/ad/upload/', 'POST', {
      advertiser_id: advertiserId,
      upload_type: 'UPLOAD_BY_URL',
      video_url: videoUrl,
    });
  }
}

module.exports = TikTokAPI;
