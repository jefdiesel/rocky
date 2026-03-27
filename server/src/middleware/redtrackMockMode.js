const path = require('path');
const mockData = require(path.join(__dirname, '..', 'mocks', 'redtrack.json'));

/**
 * Mock bot/telegram endpoints. RedTrack routes always pass through
 * to the real handler (key comes from DB, not env vars).
 */
function redtrackMockMode(req, res, next) {
  const routePath = req.baseUrl + req.path;

  // RedTrack + bot config always go to real handlers — data is in DB
  if (routePath.startsWith('/api/redtrack')) return next();
  if (routePath.startsWith('/api/bot/config')) return next();

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
    return res.json({ data: { connected: false, reason: 'Telegram not configured' } });
  }
  if (routePath.match(/^\/api\/telegram\/test\/?$/) && req.method === 'POST') {
    return res.json({ data: { sent: true, mock: true } });
  }

  next();
}

module.exports = redtrackMockMode;
