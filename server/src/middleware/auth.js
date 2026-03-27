const supabase = require('../services/supabase');
const { decrypt } = require('../services/crypto');

/**
 * Verifies the Bearer token from the Authorization header.
 * Attaches the user record to req.user on success.
 */
async function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  const token = header.slice(7);

  if (!supabase) {
    return res.status(503).json({ error: 'Database unavailable. Cannot verify authentication.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, meta_user_id, name, email, access_token, token_expiry, system_token, session_expiry, created_at, preferences, tiktok_access_token, tiktok_user_id')
      .eq('session_token', token)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid session token.' });
    }

    // Check session expiry
    if (user.session_expiry && new Date(user.session_expiry) < new Date()) {
      return res.status(401).json({ error: 'Session has expired. Please log in again.' });
    }

    // Check Meta token expiry — force re-auth
    if (user.token_expiry && new Date(user.token_expiry) < new Date()) {
      return res.status(401).json({ error: 'Meta token has expired. Please re-authenticate.', code: 'META_TOKEN_EXPIRED' });
    }

    // Decrypt Meta access token for API use
    if (user.access_token) user.access_token = decrypt(user.access_token);
    if (user.system_token) user.system_token = decrypt(user.system_token);
    if (user.tiktok_access_token) user.tiktok_access_token = decrypt(user.tiktok_access_token);

    req.user = user;
    next();
  } catch (err) {
    console.error('[auth] Token verification failed:', err.message);
    return res.status(500).json({ error: 'Internal error during authentication.' });
  }
}

/**
 * Same as verifyToken, but doesn't fail when no token is present.
 * Useful for routes that work in both authenticated and mock modes.
 */
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ') || !supabase) {
    req.user = null;
    return next();
  }

  const token = header.slice(7);

  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, meta_user_id, name, email, access_token, token_expiry, system_token, session_expiry, created_at, preferences, tiktok_access_token, tiktok_user_id')
      .eq('session_token', token)
      .single();

    if (user) {
      if (user.session_expiry && new Date(user.session_expiry) < new Date()) {
        req.user = null;
      } else {
        req.user = user;
        if (user.token_expiry && new Date(user.token_expiry) < new Date()) {
          req.metaTokenExpired = true;
        }
      }
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
}

module.exports = { verifyToken, optionalAuth };
