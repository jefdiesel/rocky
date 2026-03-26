import { format, parseISO } from 'date-fns';

export function formatCurrency(value, currency = 'USD') {
  if (value == null || isNaN(value)) return '—';
  const num = Number(value);
  const locale = currency === 'EUR' ? 'de-DE' : 'en-US';
  if (Math.abs(num) >= 1_000_000) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 1 }).format(num / 1_000_000) + 'M';
  }
  if (Math.abs(num) >= 10_000) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 1 }).format(num / 1_000) + 'K';
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

export function formatNumber(value) {
  if (value == null || isNaN(value)) return '—';
  const num = Number(value);
  if (Math.abs(num) >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(num) >= 10_000) return (num / 1_000).toFixed(1) + 'K';
  if (Math.abs(num) >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toFixed(decimals) + '%';
}

export function formatDate(date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateRange(start, end) {
  if (!start || !end) return '—';
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${format(s, 'MMM d')} – ${format(e, 'd, yyyy')}`;
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`;
  }
  return `${format(s, 'MMM d, yyyy')} – ${format(e, 'MMM d, yyyy')}`;
}

export function buildUTMUrl(baseUrl, params = {}) {
  if (!baseUrl) return '';
  try {
    const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
    const defaults = {
      utm_source: 'facebook',
      utm_medium: 'paid_social',
    };
    const merged = { ...defaults, ...params };
    Object.entries(merged).forEach(([key, val]) => {
      if (val) url.searchParams.set(key, val);
    });
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}
