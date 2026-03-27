const path = require('path');

const mocksDir = path.join(__dirname, '..', 'mocks');

const mockFiles = {
  accounts: require(path.join(mocksDir, 'tiktok-accounts.json')),
  campaigns: require(path.join(mocksDir, 'tiktok-campaigns.json')),
  insights: require(path.join(mocksDir, 'tiktok-insights.json')),
  audiences: require(path.join(mocksDir, 'tiktok-audiences.json')),
  creative: require(path.join(mocksDir, 'tiktok-creative.json')),
};

/**
 * If TIKTOK_APP_ID is not set, intercept /api/tiktok/* calls and return mock data.
 */
function tiktokMockMode(req, res, next) {
  if (process.env.TIKTOK_APP_ID) {
    return next();
  }

  const routePath = req.baseUrl + req.path;

  // ── Accounts ───────────────────────────────────
  if (routePath.match(/^\/api\/tiktok\/accounts\/?$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.accounts });
  }

  // ── Campaigns ──────────────────────────────────
  if (routePath.match(/^\/api\/tiktok\/campaigns\/[^/]+$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.campaigns });
  }
  if (routePath.match(/^\/api\/tiktok\/campaigns\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { campaign_id: 'tt_mock_camp_new', ...req.body } });
  }
  if (routePath.match(/^\/api\/tiktok\/campaigns\/[^/]+$/) && req.method === 'PATCH') {
    return res.json({ data: { campaign_id: routePath.split('/').pop(), ...req.body } });
  }
  if (routePath.match(/^\/api\/tiktok\/campaigns\/[^/]+$/) && req.method === 'DELETE') {
    return res.json({ data: { campaign_id: routePath.split('/').pop(), operation_status: 'DELETE' } });
  }

  // ── Ad Groups ──────────────────────────────────
  if (routePath.match(/^\/api\/tiktok\/campaigns\/adgroups\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { adgroup_id: 'tt_mock_ag_new', ...req.body } });
  }

  // ── Ads ────────────────────────────────────────
  if (routePath.match(/^\/api\/tiktok\/campaigns\/ads\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { ad_id: 'tt_mock_ad_new', ...req.body } });
  }

  // ── Insights ───────────────────────────────────
  if (routePath.match(/^\/api\/tiktok\/insights\/[^/]+$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.insights });
  }

  // ── Audiences ──────────────────────────────────
  if (routePath.match(/^\/api\/tiktok\/audiences\/[^/]+$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.audiences });
  }
  if (routePath.match(/^\/api\/tiktok\/audiences\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { custom_audience_id: 'tt_mock_aud_new', ...req.body } });
  }

  // ── Creative ───────────────────────────────────
  if (routePath.match(/^\/api\/tiktok\/creative\/upload/) && req.method === 'POST') {
    return res.status(201).json({
      data: { material_id: 'tt_mock_asset_new', material_type: 'VIDEO', url: 'https://placehold.co/1080x1920' },
    });
  }
  if (routePath.match(/^\/api\/tiktok\/creative\/[^/]+$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.creative });
  }

  // Not matched — pass through
  next();
}

module.exports = tiktokMockMode;
