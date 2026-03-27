/**
 * Centralized auth state.
 * Always reads from localStorage — it's the only thing that survives
 * full page reloads (OAuth redirects) and race conditions.
 */

export function getToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('meta_token') || null;
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token);
  }
}

export function clearToken() {
  localStorage.removeItem('auth_token');
}

export function setSystemToken(value) {
  localStorage.setItem('meta_token', value);
  localStorage.setItem('auth_token', value);
}

export function getStoredSystemToken() {
  return localStorage.getItem('meta_token') || '';
}

export function clearAllTokens() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('meta_token');
}

export function isAuthenticated() {
  return !!(localStorage.getItem('auth_token') || localStorage.getItem('meta_token'));
}
