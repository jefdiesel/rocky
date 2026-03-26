const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mockMode = require('./middleware/mockMode');

// ── Route imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const campaignRoutes = require('./routes/campaigns');
const insightRoutes = require('./routes/insights');
const audienceRoutes = require('./routes/audiences');
const pixelRoutes = require('./routes/pixels');
const creativeRoutes = require('./routes/creative');
const utmRoutes = require('./routes/utm');

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

// ── Mock mode (intercepts when META_APP_ID is not set) ───────────────────────
app.use('/api', mockMode);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api', campaignRoutes);           // handles /campaigns, /adsets, /ads
app.use('/api/insights', insightRoutes);
app.use('/api/audiences', audienceRoutes);
app.use('/api/pixels', pixelRoutes);
app.use('/api/creative', creativeRoutes);
app.use('/api/utm', utmRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', mock: !process.env.META_APP_ID });
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
  // ── 404 (dev mode, no built frontend) ────────────────────────────────────
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

// ── Start (only when run directly, not when imported by Vercel) ──────────────
if (require.main === module) {
  const PORT = parseInt(process.env.PORT, 10) || 3001;
  app.listen(PORT, async () => {
    console.log(`[rocky] Server listening on port ${PORT}`);
    if (!process.env.META_APP_ID) {
      console.log('[rocky] META_APP_ID not set — running in mock mode');
    }

    const supabase = require('./services/supabase');
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (error) {
          console.error('[supabase] Connection test failed:', error.message);
        } else {
          console.log('[supabase] Connected successfully');
        }
      } catch (err) {
        console.error('[supabase] Connection test error:', err.message);
      }
    }
  });
}

module.exports = app;
