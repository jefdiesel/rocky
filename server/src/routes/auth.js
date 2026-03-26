const { Router } = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

const META_API = 'https://graph.facebook.com/v19.0';
const SCOPES = 'ads_management,ads_read,pages_read_engagement,business_management';

// ── GET /auth/meta — Redirect to Meta OAuth ──────────────────────────────────
router.get('/meta', (req, res) => {
  const appId = process.env.META_APP_ID;
  if (!appId) {
    return res.status(503).json({ error: 'Meta OAuth is not configured (META_APP_ID missing).' });
  }

  const state = crypto.randomBytes(32).toString('hex');

  // Store CSRF state in a cookie (httpOnly, 10 min expiry)
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });

  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3001/api/auth/meta/callback';

  const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', SCOPES);
  url.searchParams.set('state', state);
  url.searchParams.set('response_type', 'code');

  return res.redirect(url.toString());
});

// ── GET /auth/meta/callback — Exchange code for token ────────────────────────
router.get('/meta/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const savedState = req.cookies && req.cookies.oauth_state;

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code from Meta.' });
    }

    if (!state || state !== savedState) {
      return res.status(403).json({ error: 'CSRF state mismatch. Please try logging in again.' });
    }

    // Clear the state cookie
    res.clearCookie('oauth_state');

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3001/api/auth/meta/callback';

    // Step 1: Exchange code for short-lived token
    const tokenUrl = new URL(`${META_API}/oauth/access_token`);
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('[auth] Token exchange error:', tokenData.error);
      return res.status(401).json({ error: 'Failed to exchange authorization code.' });
    }

    const shortToken = tokenData.access_token;

    // Step 2: Exchange for long-lived token
    const longUrl = new URL(`${META_API}/oauth/access_token`);
    longUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longUrl.searchParams.set('client_id', appId);
    longUrl.searchParams.set('client_secret', appSecret);
    longUrl.searchParams.set('fb_exchange_token', shortToken);

    const longRes = await fetch(longUrl.toString());
    const longData = await longRes.json();

    if (longData.error) {
      console.error('[auth] Long-lived token exchange error:', longData.error);
      return res.status(401).json({ error: 'Failed to obtain long-lived token.' });
    }

    const accessToken = longData.access_token;
    const expiresIn = longData.expires_in || 5184000; // default 60 days

    // Step 3: Fetch user info
    const meRes = await fetch(`${META_API}/me?fields=id,name,email&access_token=${accessToken}`);
    const meData = await meRes.json();

    if (meData.error) {
      console.error('[auth] /me fetch error:', meData.error);
      return res.status(401).json({ error: 'Failed to fetch user info from Meta.' });
    }

    // Step 4: Create session token
    const sessionToken = crypto.randomBytes(48).toString('hex');
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    // Step 5: Upsert user in Supabase
    const { data: user, error: upsertErr } = await supabase
      .from('users')
      .upsert(
        {
          meta_user_id: meData.id,
          name: meData.name || null,
          email: meData.email || null,
          access_token: accessToken,
          token_expiry: tokenExpiry.toISOString(),
          session_token: sessionToken,
          session_expiry: sessionExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'meta_user_id' }
      )
      .select()
      .single();

    if (upsertErr) {
      console.error('[auth] Supabase upsert error:', upsertErr);
      return res.status(500).json({ error: 'Failed to save user session.' });
    }

    // Redirect to frontend with the session token
    const clientUrl = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/auth/callback?token=${sessionToken}`);
  } catch (err) {
    console.error('[auth] Callback error:', err);
    return res.status(500).json({ error: 'Internal error during authentication.' });
  }
});

// ── POST /auth/system-token — Accept a system user token ─────────────────────
router.post('/system-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required.' });
    }

    // Validate the token by calling /me
    const meRes = await fetch(`${META_API}/me?fields=id,name&access_token=${token}`);
    const meData = await meRes.json();

    if (meData.error) {
      return res.status(401).json({ error: 'Invalid system token. Meta API validation failed.' });
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const sessionToken = crypto.randomBytes(48).toString('hex');
    const sessionExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    const { data: user, error: upsertErr } = await supabase
      .from('users')
      .upsert(
        {
          meta_user_id: meData.id,
          name: meData.name || 'System User',
          system_token: token,
          access_token: token,
          session_token: sessionToken,
          session_expiry: sessionExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'meta_user_id' }
      )
      .select()
      .single();

    if (upsertErr) {
      console.error('[auth] System token upsert error:', upsertErr);
      return res.status(500).json({ error: 'Failed to save system token.' });
    }

    return res.json({
      data: {
        session_token: sessionToken,
        user: {
          id: user.id,
          name: user.name,
          meta_user_id: user.meta_user_id,
        },
      },
    });
  } catch (err) {
    console.error('[auth] system-token error:', err);
    return res.status(500).json({ error: 'Internal error storing system token.' });
  }
});

// ── GET /auth/me — Return current user info ──────────────────────────────────
router.get('/me', verifyToken, (req, res) => {
  const { id, name, email, meta_user_id, token_expiry, created_at } = req.user;
  return res.json({
    data: {
      id,
      name,
      email,
      meta_user_id,
      token_expiry,
      meta_token_expired: !!req.metaTokenExpired,
      created_at,
    },
  });
});

// ── POST /auth/logout — Invalidate session ───────────────────────────────────
router.post('/logout', verifyToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { error } = await supabase
      .from('users')
      .update({ session_token: null, session_expiry: null })
      .eq('id', req.user.id);

    if (error) {
      console.error('[auth] Logout error:', error);
      return res.status(500).json({ error: 'Failed to invalidate session.' });
    }

    return res.json({ data: { success: true } });
  } catch (err) {
    console.error('[auth] Logout error:', err);
    return res.status(500).json({ error: 'Internal error during logout.' });
  }
});

module.exports = router;
