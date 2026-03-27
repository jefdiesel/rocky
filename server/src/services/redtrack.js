const fetch = require('node-fetch');

const BASE_URL = 'https://api.redtrack.io/report';

class RedTrackAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async request(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        const text = await response.text();
        return {
          success: false,
          error: { message: `RedTrack API error (${response.status}): ${text}`, status: response.status },
          data: null,
        };
      }
      const data = await response.json();
      return { success: true, data, error: null };
    } catch (err) {
      return {
        success: false,
        error: { message: `Network error: ${err.message}`, status: 502 },
        data: null,
      };
    }
  }

  async getCampaigns(params = {}) {
    return this.request('/campaign', {
      date_from: params.date_from || todayStr(),
      date_to: params.date_to || todayStr(),
      ...params,
    });
  }

  async getOffers(params = {}) {
    return this.request('/offer', {
      date_from: params.date_from || todayStr(),
      date_to: params.date_to || todayStr(),
      ...params,
    });
  }

  /**
   * Parse RedTrack response into normalized campaign metrics.
   * RedTrack returns arrays with varying field names depending on the report type.
   */
  static normalize(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => ({
      campaign_id: row.campaign_id || row.id || '',
      campaign_name: row.campaign_name || row.name || 'Unknown',
      clicks: num(row.clicks),
      conversions: num(row.conversions || row.total_conversions),
      revenue: num(row.revenue || row.total_revenue),
      cost: num(row.cost || row.total_cost),
      profit: num(row.profit || (num(row.revenue) - num(row.cost))),
      roi: num(row.roi),
      epc: num(row.epc),
    }));
  }
}

function num(v) {
  if (v == null) return 0;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? 0 : n;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

module.exports = RedTrackAPI;
