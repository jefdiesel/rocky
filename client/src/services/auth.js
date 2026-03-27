/**
 * Centralized auth state — single source of truth for tokens.
 * All token reads/writes go through here, not raw localStorage.
 */

let _token = localStorage.getItem('auth_token') || localStorage.getItem('meta_token') || null;

export function getToken() {
  return _token;
}

export function setToken(token) {
  _token = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  }
}

export function clearToken() {
  _token = null;
  localStorage.removeItem('auth_token');
}

export function setSystemToken(value) {
  _token = value;
  localStorage.setItem('meta_token', value);
  localStorage.setItem('auth_token', value);
}

export function getStoredSystemToken() {
  return localStorage.getItem('meta_token') || '';
}

export function clearAllTokens() {
  _token = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('meta_token');
}

export function isAuthenticated() {
  return !!_token;
}

// Re-sync from localStorage (e.g., after another tab writes)
export function syncFromStorage() {
  _token = localStorage.getItem('auth_token') || localStorage.getItem('meta_token') || null;
  return _token;
}
