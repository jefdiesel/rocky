import { getToken, isAuthenticated } from './auth.js';

const BASE_URL = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getAccountId() {
  return localStorage.getItem('selected_account_id');
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let data;
    try { data = await response.json(); } catch { data = null; }

    const message = data?.error || data?.message || getErrorMessage(response.status);
    throw new ApiError(message, response.status, data);
  }

  return response.json();
}

function getErrorMessage(status) {
  const messages = {
    400: 'Invalid request. Please check your input.',
    401: 'Session expired. Please reconnect your Meta account.',
    403: 'You do not have permission to perform this action.',
    404: 'Resource not found.',
    429: 'Rate limited by Meta API. Please wait a moment.',
    500: 'Server error. Please try again later.',
    502: 'Meta API is temporarily unavailable.',
    503: 'Service unavailable. Please try again later.',
  };
  return messages[status] || `Unexpected error (${status})`;
}

// Helper to get current account ID, throwing if none selected
function requireAccountId() {
  const id = getAccountId();
  if (!id) throw new ApiError('No ad account selected', 400);
  return id;
}

export const api = {
  // Auth
  getMe: () => request('/auth/me'),
  postSystemToken: (token) => request('/auth/system-token', { method: 'POST', body: JSON.stringify({ token }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Accounts
  getAccounts: () => request('/accounts'),
  getAccount: (id) => request(`/accounts/${id}`),

  // Campaigns — backend expects /campaigns/:accountId for GET
  getCampaigns: (params = {}) => {
    const accountId = params.account_id || requireAccountId();
    const qs = new URLSearchParams(params).toString();
    return request(`/campaigns/${accountId}${qs ? `?${qs}` : ''}`);
  },
  createCampaign: (data) => request('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id, data) => request(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCampaign: (id) => request(`/campaigns/${id}`, { method: 'DELETE' }),

  // Ad Sets
  createAdSet: (data) => request('/adsets', { method: 'POST', body: JSON.stringify(data) }),
  updateAdSet: (id, data) => request(`/adsets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Ads
  createAd: (data) => request('/ads', { method: 'POST', body: JSON.stringify(data) }),
  updateAd: (id, data) => request(`/ads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Insights — backend expects /insights/:accountId
  getInsights: (params = {}) => {
    const accountId = params.account_id || requireAccountId();
    const query = { ...params };
    delete query.account_id;
    const qs = new URLSearchParams(query).toString();
    return request(`/insights/${accountId}${qs ? `?${qs}` : ''}`);
  },
  getPacing: (accountId) => {
    const id = accountId || requireAccountId();
    return request(`/insights/${id}/pacing`);
  },

  // Audiences — backend expects /audiences/:accountId
  getAudiences: (accountId) => {
    const id = accountId || requireAccountId();
    return request(`/audiences/${id}`);
  },
  createAudience: (data) => request('/audiences', { method: 'POST', body: JSON.stringify(data) }),
  createLookalike: (data) => request('/audiences/lookalike', { method: 'POST', body: JSON.stringify(data) }),
  getAudienceOverlap: (audience1, audience2) =>
    request('/audiences/overlap', { method: 'POST', body: JSON.stringify({ audience_id_1: audience1, audience_id_2: audience2 }) }),

  // Creative — backend expects /creative/:accountId
  getCreatives: (accountId) => {
    const id = accountId || requireAccountId();
    return request(`/creative/${id}`);
  },
  uploadImage: (formData) => request('/creative/upload/image', { method: 'POST', body: formData }),
  uploadVideo: (formData) => request('/creative/upload/video', { method: 'POST', body: formData }),
  deleteCreative: (id) => request(`/creative/${id}`, { method: 'DELETE' }),

  // Pixels — backend expects /pixels/:accountId
  getPixels: (accountId) => {
    const id = accountId || requireAccountId();
    return request(`/pixels/${id}`);
  },
  getPixelStats: (pixelId) => request(`/pixels/${pixelId}/stats`),
  getPixelEvents: (pixelId) => request(`/pixels/${pixelId}/events`),

  // Settings / Preferences
  getPreferences: () => request('/settings'),
  savePreferences: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // UTM
  getUtmTemplates: () => request('/utm/templates'),
  createUtmTemplate: (data) => request('/utm/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateUtmTemplate: (id, data) => request(`/utm/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUtmTemplate: (id) => request(`/utm/templates/${id}`, { method: 'DELETE' }),
  buildUtmUrl: (data) => request('/utm/build', { method: 'POST', body: JSON.stringify(data) }),

  // Drafts
  saveDraft: (data) => request('/campaigns/draft', { method: 'POST', body: JSON.stringify(data) }),
  getDrafts: (accountId) => {
    const id = accountId || requireAccountId();
    return request(`/campaigns/drafts/${id}`);
  },
  deleteDraft: (id) => request(`/campaigns/draft/${id}`, { method: 'DELETE' }),

  // ── TikTok ──────────────────────────────────────────────────────────────────
  tiktok: {
    getAccounts: () => request('/tiktok/accounts'),
    getCampaigns: (advertiserId) => request(`/tiktok/campaigns/${advertiserId}`),
    createCampaign: (data) => request('/tiktok/campaigns', { method: 'POST', body: JSON.stringify(data) }),
    updateCampaign: (id, data) => request(`/tiktok/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteCampaign: (id, data) => request(`/tiktok/campaigns/${id}`, { method: 'DELETE', body: JSON.stringify(data) }),
    createAdGroup: (data) => request('/tiktok/campaigns/adgroups', { method: 'POST', body: JSON.stringify(data) }),
    createAd: (data) => request('/tiktok/campaigns/ads', { method: 'POST', body: JSON.stringify(data) }),
    getInsights: (advertiserId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/tiktok/insights/${advertiserId}${qs ? `?${qs}` : ''}`);
    },
    getAudiences: (advertiserId) => request(`/tiktok/audiences/${advertiserId}`),
    createAudience: (data) => request('/tiktok/audiences', { method: 'POST', body: JSON.stringify(data) }),
    getCreatives: (advertiserId) => request(`/tiktok/creative/${advertiserId}`),
    uploadImage: (data) => request('/tiktok/creative/upload/image', { method: 'POST', body: JSON.stringify(data) }),
    uploadVideo: (data) => request('/tiktok/creative/upload/video', { method: 'POST', body: JSON.stringify(data) }),
  },
};

export { isAuthenticated };

export function isMockData(response) {
  return response?._mock === true || response?.mock === true;
}

export default api;
