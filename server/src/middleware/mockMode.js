const path = require('path');

const mocksDir = path.join(__dirname, '..', 'mocks');

const mockFiles = {
  accounts: require(path.join(mocksDir, 'accounts.json')),
  campaigns: require(path.join(mocksDir, 'campaigns.json')),
  insights: require(path.join(mocksDir, 'insights.json')),
  audiences: require(path.join(mocksDir, 'audiences.json')),
  pixels: require(path.join(mocksDir, 'pixels.json')),
  creative: require(path.join(mocksDir, 'creative.json')),
};

/**
 * If META_APP_ID is not set, intercept API calls and return mock data.
 */
function mockMode(req, res, next) {
  if (process.env.META_APP_ID) {
    return next();
  }

  const routePath = req.baseUrl + req.path;

  // ── Accounts ───────────────────────────────────
  if (routePath.match(/^\/api\/accounts\/?$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.accounts });
  }
  if (routePath.match(/^\/api\/accounts\/[^/]+$/) && req.method === 'GET') {
    const id = routePath.split('/').pop();
    const account = mockFiles.accounts.find(
      (a) => a.account_id === id || a.id === id
    );
    return account
      ? res.json({ data: account })
      : res.status(404).json({ error: 'Account not found in mock data.' });
  }

  // ── Campaigns ──────────────────────────────────
  if (routePath.match(/^\/api\/campaigns\/[^/]+$/) && req.method === 'GET') {
    const accountId = routePath.split('/').pop();
    const campaigns = mockFiles.campaigns.filter(
      (c) => c.account_id === accountId
    );
    return res.json({ data: campaigns.length ? campaigns : mockFiles.campaigns });
  }
  if (routePath.match(/^\/api\/campaigns\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { id: 'mock_campaign_new', ...req.body } });
  }
  if (routePath.match(/^\/api\/campaigns\/[^/]+$/) && req.method === 'PATCH') {
    return res.json({ data: { id: routePath.split('/').pop(), ...req.body } });
  }
  if (routePath.match(/^\/api\/campaigns\/[^/]+$/) && req.method === 'DELETE') {
    return res.json({ data: { id: routePath.split('/').pop(), status: 'DELETED' } });
  }
  if (routePath.match(/^\/api\/adsets\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { id: 'mock_adset_new', ...req.body } });
  }
  if (routePath.match(/^\/api\/adsets\/[^/]+$/) && req.method === 'PATCH') {
    return res.json({ data: { id: routePath.split('/').pop(), ...req.body } });
  }
  if (routePath.match(/^\/api\/ads\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { id: 'mock_ad_new', ...req.body } });
  }
  if (routePath.match(/^\/api\/ads\/[^/]+$/) && req.method === 'PATCH') {
    return res.json({ data: { id: routePath.split('/').pop(), ...req.body } });
  }

  // ── Drafts ─────────────────────────────────────
  if (routePath.match(/^\/api\/campaigns\/draft\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { id: 'mock_draft_new', ...req.body } });
  }
  if (routePath.match(/^\/api\/campaigns\/drafts\/[^/]+$/) && req.method === 'GET') {
    return res.json({ data: [] });
  }
  if (routePath.match(/^\/api\/campaigns\/draft\/[^/]+$/) && req.method === 'DELETE') {
    return res.json({ data: { deleted: true } });
  }

  // ── Insights ───────────────────────────────────
  if (routePath.match(/^\/api\/insights\/[^/]+\/pacing$/) && req.method === 'GET') {
    // Generate pacing from mock insights
    const pacing = mockFiles.campaigns.slice(0, 3).map((c) => ({
      campaign_id: c.id,
      campaign_name: c.name,
      daily_budget: c.daily_budget || 100,
      lifetime_budget: c.lifetime_budget || null,
      days_elapsed: 15,
      days_remaining: 15,
      total_spend: 1500,
      projected_spend: 3000,
      pace: 'on_track',
    }));
    return res.json({ data: pacing });
  }
  if (routePath.match(/^\/api\/insights\/[^/]+$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.insights });
  }

  // ── Audiences ──────────────────────────────────
  if (routePath.match(/^\/api\/audiences\/[^/]+$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.audiences });
  }
  if (routePath.match(/^\/api\/audiences\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { id: 'mock_audience_new', ...req.body } });
  }
  if (routePath.match(/^\/api\/audiences\/lookalike/) && req.method === 'POST') {
    return res.status(201).json({ data: { id: 'mock_lal_new', ...req.body } });
  }
  if (routePath.match(/^\/api\/audiences\/overlap/) && req.method === 'POST') {
    return res.json({
      data: {
        audience_1: req.body.audience_id_1 || 'aud_1',
        audience_2: req.body.audience_id_2 || 'aud_2',
        overlap_percentage: 23.5,
        estimated_overlap_size: 45000,
      },
    });
  }

  // ── Pixels ─────────────────────────────────────
  if (routePath.match(/^\/api\/pixels\/[^/]+\/stats$/) && req.method === 'GET') {
    const pixel = mockFiles.pixels[0];
    return res.json({ data: pixel ? pixel.events : [] });
  }
  if (routePath.match(/^\/api\/pixels\/[^/]+\/events$/) && req.method === 'GET') {
    return res.json({ data: [] });
  }
  if (routePath.match(/^\/api\/pixels\/[^/]+$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.pixels });
  }

  // ── Creative ───────────────────────────────────
  if (routePath.match(/^\/api\/creative\/upload/) && req.method === 'POST') {
    return res.status(201).json({
      data: { id: 'mock_asset_new', type: 'image', url: 'https://placehold.co/1080x1080' },
    });
  }
  if (routePath.match(/^\/api\/creative\/[^/]+$/) && req.method === 'GET') {
    return res.json({ data: mockFiles.creative });
  }
  if (routePath.match(/^\/api\/creative\/[^/]+$/) && req.method === 'DELETE') {
    return res.json({ data: { deleted: true } });
  }

  // ── UTM ────────────────────────────────────────
  if (routePath.match(/^\/api\/utm\/build/) && req.method === 'POST') {
    const { url: baseUrl, source, medium, campaign, content, term } = req.body;
    const u = new URL(baseUrl || 'https://example.com');
    if (source) u.searchParams.set('utm_source', source);
    if (medium) u.searchParams.set('utm_medium', medium);
    if (campaign) u.searchParams.set('utm_campaign', campaign);
    if (content) u.searchParams.set('utm_content', content);
    if (term) u.searchParams.set('utm_term', term);
    return res.json({ data: { tagged_url: u.toString() } });
  }
  if (routePath.match(/^\/api\/utm\/templates/) && (req.method === 'GET')) {
    return res.json({ data: [] });
  }
  if (routePath.match(/^\/api\/utm\/templates/) && req.method === 'POST') {
    return res.status(201).json({ data: { id: 'mock_utm_new', ...req.body } });
  }
  if (routePath.match(/^\/api\/utm\/templates\/[^/]+$/) && req.method === 'PUT') {
    return res.json({ data: { id: routePath.split('/').pop(), ...req.body } });
  }
  if (routePath.match(/^\/api\/utm\/templates\/[^/]+$/) && req.method === 'DELETE') {
    return res.json({ data: { deleted: true } });
  }

  // ── Auth mock ──────────────────────────────────
  if (routePath.match(/^\/api\/auth\/me/) && req.method === 'GET') {
    return res.json({
      data: {
        id: 'mock_user_1',
        name: 'Demo User',
        email: 'demo@example.com',
        meta_user_id: '000000000000',
      },
    });
  }

  // Not matched — pass through
  next();
}

module.exports = mockMode;
