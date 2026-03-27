/**
 * No mock mode for RedTrack/Bot/Telegram — all routes go to real handlers.
 * Config and keys are stored in Supabase, not env vars.
 */
function redtrackMockMode(req, res, next) {
  next();
}

module.exports = redtrackMockMode;
