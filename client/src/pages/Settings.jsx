import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Save, Trash2, ExternalLink, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import PageGuide from '../components/common/PageGuide.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import api from '../services/api.js';

const DEFAULT_UTM = {
  source: 'facebook',
  medium: 'paid_social',
  campaign: '{campaign_name}',
  content: '{ad_name}',
};

const DEFAULT_NOTIFICATIONS = {
  budgetAlerts: true,
  frequencyAlerts: true,
  performanceDrops: true,
  dailyDigest: false,
  weeklyReport: true,
};

function loadPref(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem('meta_token') || '');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Default UTM settings — load from localStorage
  const [utmDefaults, setUtmDefaults] = useState(() => loadPref('rocky_utm_defaults', DEFAULT_UTM));

  // Notification prefs — load from localStorage
  const [notifications, setNotifications] = useState(() => loadPref('rocky_notifications', DEFAULT_NOTIFICATIONS));

  // Load preferences from API on mount (overrides localStorage if server has data)
  useEffect(() => {
    if (!localStorage.getItem('auth_token')) return;
    api.getMe().then((res) => {
      const prefs = res.data?.preferences;
      if (prefs) {
        if (prefs.utm_defaults) {
          setUtmDefaults(prefs.utm_defaults);
          localStorage.setItem('rocky_utm_defaults', JSON.stringify(prefs.utm_defaults));
        }
        if (prefs.notifications) {
          setNotifications(prefs.notifications);
          localStorage.setItem('rocky_notifications', JSON.stringify(prefs.notifications));
        }
      }
    }).catch(() => { /* API unavailable, use localStorage */ });
  }, []);

  // Persist UTM defaults on change
  useEffect(() => {
    localStorage.setItem('rocky_utm_defaults', JSON.stringify(utmDefaults));
  }, [utmDefaults]);

  // Persist notification prefs on change
  useEffect(() => {
    localStorage.setItem('rocky_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const { data: authStatus } = useQuery({
    queryKey: ['auth-status'],
    queryFn: async () => {
      try {
        const res = await api.getMe();
        return { connected: true, account_name: res.data?.name, token_expires: res.data?.token_expiry, meta_token_expired: res.data?.meta_token_expired };
      } catch {
        return { connected: !!localStorage.getItem('auth_token'), account_name: null, token_expires: null };
      }
    },
  });

  const handleSaveToken = async () => {
    try {
      const res = await api.postSystemToken(token);
      if (res.data?.session_token) {
        localStorage.setItem('auth_token', res.data.session_token);
      }
      setTokenSaved(true);
      setTimeout(() => setTokenSaved(false), 2000);
    } catch (err) {
      alert('Failed to validate token: ' + (err.message || 'Unknown error'));
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      // Invalidate all react-query caches so next navigation refetches from API
      await queryClient.invalidateQueries();
      queryClient.clear();
    } catch {
      // ignore errors
    }
    setClearingCache(false);
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageGuide
        pageKey="settings"
        title="Settings Quick Guide"
        tips={[
          'Connect your Meta account to pull real ad data from the Marketing API',
          'System User tokens provide server-to-server access without personal login',
          'Notification preferences are saved to your account automatically',
          'Clear cache forces a fresh pull from Meta on next page load',
        ]}
      />
      <h1 className="text-lg font-semibold text-zinc-100">Settings</h1>

      {/* Connected Account */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Connected Meta Account</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
                <span className="text-lg font-bold text-blue-400">f</span>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">{authStatus?.account_name || 'Not connected'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={authStatus?.connected ? 'ACTIVE' : 'INACTIVE'} />
                  {authStatus?.token_expires && (
                    <span className="text-2xs text-zinc-500">
                      Token expires: {authStatus.token_expires}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <a
            href="/api/auth/meta"
            className="flex items-center gap-1.5 rounded-md bg-blue-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/25"
          >
            <RefreshCw size={14} /> {authStatus?.connected ? 'Reconnect' : 'Connect Meta Account'}
          </a>
        </div>
      </div>

      {/* System User Token */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-1 text-sm font-semibold text-zinc-200">System User Token</h3>
        <p className="mb-4 text-2xs text-zinc-500">
          Enter your Meta System User access token for server-to-server API access.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter system user token..."
            className="flex-1 font-mono text-xs"
          />
          <button
            onClick={handleSaveToken}
            className={clsx(
              'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors',
              tokenSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            {tokenSaved ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save</>}
          </button>
        </div>
        <div className="mt-2 flex items-start gap-1.5 rounded bg-amber-500/10 px-3 py-2">
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0 text-amber-400" />
          <p className="text-2xs text-amber-400/80">
            Keep this token secure. It provides full access to your ad account via the Marketing API.
          </p>
        </div>
      </div>

      {/* Default UTM Settings */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Default UTM Parameters</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { key: 'source', label: 'utm_source' },
            { key: 'medium', label: 'utm_medium' },
            { key: 'campaign', label: 'utm_campaign' },
            { key: 'content', label: 'utm_content' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-2xs text-zinc-500">{label}</label>
              <input
                type="text"
                value={utmDefaults[key]}
                onChange={(e) => setUtmDefaults({ ...utmDefaults, [key]: e.target.value })}
                className="w-full"
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-2xs text-zinc-600">
          Use &#123;campaign_name&#125;, &#123;ad_set_name&#125;, &#123;ad_name&#125; as dynamic placeholders.
        </p>
      </div>

      {/* Cache Management */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Cache Management</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-zinc-300">Clear all cached data</p>
            <p className="text-2xs text-zinc-500">Forces a fresh fetch from the Meta API on next load.</p>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearingCache}
            className={clsx(
              'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors',
              cacheCleared
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            )}
          >
            {clearingCache ? <LoadingSpinner size={13} /> : cacheCleared ? <Check size={13} /> : <Trash2 size={13} />}
            {clearingCache ? 'Clearing...' : cacheCleared ? 'Cleared' : 'Clear Cache'}
          </button>
        </div>
        <div className="space-y-1">
          {[
            { label: 'Accounts', time: '5 min ago' },
            { label: 'Campaigns', time: '2 min ago' },
            { label: 'Insights', time: '8 min ago' },
            { label: 'Audiences', time: '12 min ago' },
            { label: 'Creatives', time: '15 min ago' },
          ].map(({ label, time }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <span className="text-xs text-zinc-400">{label}</span>
              <span className="text-2xs text-zinc-600">Last refreshed: {time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { key: 'budgetAlerts', label: 'Budget alerts', desc: 'Notify when campaigns are overpacing or underpacing.' },
            { key: 'frequencyAlerts', label: 'Frequency alerts', desc: 'Notify when ad set frequency exceeds threshold.' },
            { key: 'performanceDrops', label: 'Performance drop alerts', desc: 'Notify on significant CPA increases or ROAS drops.' },
            { key: 'dailyDigest', label: 'Daily digest email', desc: 'Summary of key metrics sent daily at 9 AM.' },
            { key: 'weeklyReport', label: 'Weekly performance report', desc: 'Comprehensive report every Monday morning.' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-zinc-300">{label}</p>
                <p className="text-2xs text-zinc-500">{desc}</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                className={clsx(
                  'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors',
                  notifications[key] ? 'bg-primary-600' : 'bg-zinc-700'
                )}
              >
                <span
                  className={clsx(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5',
                    notifications[key] ? 'translate-x-[18px]' : 'translate-x-[2px]'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={async () => {
              localStorage.setItem('rocky_notifications', JSON.stringify(notifications));
              localStorage.setItem('rocky_utm_defaults', JSON.stringify(utmDefaults));
              // Also persist to API if authenticated
              if (localStorage.getItem('auth_token')) {
                try {
                  await api.savePreferences({ utm_defaults: utmDefaults, notifications });
                } catch { /* API unavailable, localStorage is the fallback */ }
              }
              setPrefsSaved(true);
              setTimeout(() => setPrefsSaved(false), 2000);
            }}
            className={clsx(
              'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors',
              prefsSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            {prefsSaved ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save Preferences</>}
          </button>
        </div>
      </div>
    </div>
  );
}
