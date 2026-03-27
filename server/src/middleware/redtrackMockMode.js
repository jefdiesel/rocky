const path = require('path');
const mockData = require(path.join(__dirname, '..', 'mocks', 'redtrack.json'));

/**
 * If REDTRACK_API_KEY is not set, intercept /api/redtrack/* and /api/bot/* calls.
 */
function redtrackMockMode(req, res, next) {
  if (process.env.REDTRACK_API_KEY) return next();

  const routePath = req.baseUrl + req.path;

  // ── RedTrack ───────────────────────────────────
  if (routePath.match(/^\/api\/redtrack\/campaigns\/?$/) && req.method === 'GET') {
    return res.json({ data: mockData.campaigns });
  }
  if (routePath.match(/^\/api\/redtrack\/sync\/?$/) && req.method === 'GET') {
    return res.json({ data: mockData.campaigns, synced_at: new Date().toISOString() });
  }
  if (routePath.match(/^\/api\/redtrack\/mappings\/?$/) && req.method === 'GET') {
    return res.json({ data: mockData.mappings });
  }
  if (routePath.match(/^\/api\/redtrack\/mappings\/?$/) && req.method === 'POST') {
    return res.status(201).json({ data: { id: 'mock_mapping_new', ...req.body } });
  }
  if (routePath.match(/^\/api\/redtrack\/mappings\/[^/]+$/) && req.method === 'DELETE') {
    return res.json({ data: { deleted: true } });
  }

  // ── Bot Config ─────────────────────────────────
  if (routePath.match(/^\/api\/bot\/config\/?$/) && req.method === 'GET') {
    return res.json({
      data: {
        telegram_token_set: true,
        telegram_chat_id: '123456789',
        redtrack_api_key_set: false,
        roi_threshold: 25,
      },
    });
  }
  if (routePath.match(/^\/api\/bot\/config\/?$/) && req.method === 'PUT') {
    return res.json({ data: { saved: true } });
  }

  // ── Alerts ─────────────────────────────────────
  if (routePath.match(/^\/api\/bot\/alerts\/?$/) && req.method === 'GET') {
    return res.json({ data: mockData.alerts });
  }

  // ── Snooze ─────────────────────────────────────
  if (routePath.match(/^\/api\/bot\/snooze\/?$/) && req.method === 'GET') {
    return res.json({ data: mockData.snooze });
  }
  if (routePath.match(/^\/api\/bot\/snooze\/[^/]+$/) && req.method === 'DELETE') {
    return res.json({ data: { deleted: true } });
  }

  // ── Telegram ───────────────────────────────────
  if (routePath.match(/^\/api\/telegram\/status\/?$/) && req.method === 'GET') {
    return res.json({ data: { connected: false, reason: 'Mock mode — TELEGRAM_BOT_TOKEN not set' } });
  }
  if (routePath.match(/^\/api\/telegram\/test\/?$/) && req.method === 'POST') {
    return res.json({ data: { sent: true, mock: true } });
  }

  next();
}

module.exports = redtrackMockMode;
