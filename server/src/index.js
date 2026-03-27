const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mockMode = require('./middleware/mockMode');
const tiktokMockMode = require('./middleware/tiktokMockMode');
const redtrackMockMode = require('./middleware/redtrackMockMode');

// ── Route imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const campaignRoutes = require('./routes/campaigns');
const insightRoutes = require('./routes/insights');
const audienceRoutes = require('./routes/audiences');
const pixelRoutes = require('./routes/pixels');
const creativeRoutes = require('./routes/creative');
const utmRoutes = require('./routes/utm');
const settingsRoutes = require('./routes/settings');
const waitlistRoutes = require('./routes/waitlist');

// TikTok routes
const tiktokAccountRoutes = require('./routes/tiktok/accounts');
const tiktokCampaignRoutes = require('./routes/tiktok/campaigns');
const tiktokInsightRoutes = require('./routes/tiktok/insights');
const tiktokAudienceRoutes = require('./routes/tiktok/audiences');
const tiktokCreativeRoutes = require('./routes/tiktok/creative');

// RedTrack + Telegram routes
const redtrackRoutes = require('./routes/redtrack');
const telegramRoutes = require('./routes/telegram');
const botSettingsRoutes = require('./routes/bot-settings');

const app = express();

// ── Global middleware ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map(s => s.trim())
    : 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting: 200 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a moment.' },
});
app.use('/api/', limiter);

// ── Mock mode (intercepts when API keys are not set) ────────────────────────
app.use('/api', mockMode);
app.use('/api', tiktokMockMode);
app.use('/api', redtrackMockMode);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api', campaignRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/audiences', audienceRoutes);
app.use('/api/pixels', pixelRoutes);
app.use('/api/creative', creativeRoutes);
app.use('/api/utm', utmRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/waitlist', waitlistRoutes);

// TikTok
app.use('/api/tiktok/accounts', tiktokAccountRoutes);
app.use('/api/tiktok/campaigns', tiktokCampaignRoutes);
app.use('/api/tiktok/insights', tiktokInsightRoutes);
app.use('/api/tiktok/audiences', tiktokAudienceRoutes);
app.use('/api/tiktok/creative', tiktokCreativeRoutes);

// RedTrack + Telegram
app.use('/api/redtrack', redtrackRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/bot', botSettingsRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mock_meta: !process.env.META_APP_ID,
    mock_tiktok: !process.env.TIKTOK_APP_ID,
    mock_redtrack: !process.env.REDTRACK_API_KEY,
    telegram: !!process.env.TELEGRAM_BOT_TOKEN,
  });
});

// ── Serve frontend in production ─────────────────────────────────────────────
const clientDist = path.resolve(__dirname, '../../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
  });
}

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err.stack || err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.expose ? err.message : 'Internal server error.',
  });
});

// ── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = parseInt(process.env.PORT, 10) || 3001;
  app.listen(PORT, async () => {
    console.log(`[remi] Server listening on port ${PORT}`);
    if (!process.env.META_APP_ID) console.log('[remi] META_APP_ID not set — Meta mock mode');
    if (!process.env.TIKTOK_APP_ID) console.log('[remi] TIKTOK_APP_ID not set — TikTok mock mode');
    if (!process.env.REDTRACK_API_KEY) console.log('[remi] REDTRACK_API_KEY not set — RedTrack mock mode');

    // Start RedTrack poller
    const { startPolling } = require('./services/redtrackPoller');
    startPolling();

    // Register Telegram webhook
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.CLIENT_ORIGIN) {
      const TelegramBot = require('./services/telegram');
      const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID || '');
      const webhookUrl = `${process.env.CLIENT_ORIGIN.split(',')[0].trim()}/api/telegram/webhook`;
      const result = await bot.registerWebhook(webhookUrl);
      console.log(`[telegram] Webhook ${result.success ? 'registered' : 'failed'}: ${webhookUrl}`);
    }

    // Supabase connection test
    const supabase = require('./services/supabase');
    if (supabase) {
      try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) console.error('[supabase] Connection test failed:', error.message);
        else console.log('[supabase] Connected successfully');
      } catch (err) {
        console.error('[supabase] Connection test error:', err.message);
      }
    }
  });
}

module.exports = app;
