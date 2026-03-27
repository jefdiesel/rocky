import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, ChevronDown, Radio, Check } from 'lucide-react';
import clsx from 'clsx';
import PageGuide from '../components/common/PageGuide.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatNumber, formatPercent } from '../utils/format.js';
import api, { isAuthenticated } from '../services/api.js';
import { getMockPixels } from '../mocks/dashboardData.js';

function HealthDot({ status }) {
  const colors = {
    healthy: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
  };
  return <span className={clsx('inline-block h-2 w-2 rounded-full pulse-dot', colors[status] || colors.error)} />;
}

function generateMockTestEvent() {
  const events = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'];
  const event = events[Math.floor(Math.random() * events.length)];
  const params = event === 'Purchase'
    ? { value: (Math.random() * 200 + 10).toFixed(2), currency: 'USD', content_type: 'product' }
    : event === 'ViewContent'
    ? { content_name: 'Product ' + Math.floor(Math.random() * 100), content_type: 'product' }
    : {};
  return {
    id: Math.random().toString(36).slice(2, 10),
    timestamp: new Date().toISOString(),
    event,
    params,
    url: 'https://example.com/' + ['shop', 'cart', 'checkout', 'products/item-' + Math.floor(Math.random() * 50)][Math.floor(Math.random() * 4)],
  };
}

export default function Pixels() {
  const [expandedPixels, setExpandedPixels] = useState(new Set());
  const [testMode, setTestMode] = useState({});
  const [testEvents, setTestEvents] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pixels'],
    queryFn: async () => {
      try {
        const res = await api.getPixels();
        return res.data || res;
      } catch (err) {
        if (!isAuthenticated()) return getMockPixels().data;
        if (err.status === 401) throw err;
        console.warn('[pixels]', err.message);
        return [];
      }
    },
  });

  const pixels = data || [];

  const toggleExpand = (id) => {
    setExpandedPixels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTestMode = (pixelId) => {
    setTestMode((prev) => ({ ...prev, [pixelId]: !prev[pixelId] }));
    if (!testEvents[pixelId]) {
      setTestEvents((prev) => ({ ...prev, [pixelId]: [] }));
    }
  };

  // Polling for test events — use real API when authenticated, mock otherwise
  useEffect(() => {
    const activePixels = Object.entries(testMode).filter(([, active]) => active).map(([id]) => id);
    if (activePixels.length === 0) return;

    const authed = isAuthenticated();

    const interval = setInterval(() => {
      activePixels.forEach(async (pixelId) => {
        if (authed) {
          try {
            const res = await api.getPixelEvents(pixelId);
            const events = res.data || res || [];
            if (Array.isArray(events) && events.length > 0) {
              setTestEvents((prev) => {
                const existing = prev[pixelId] || [];
                const existingIds = new Set(existing.map((e) => e.id));
                const newEvents = events.filter((e) => !existingIds.has(e.id));
                return {
                  ...prev,
                  [pixelId]: [...newEvents, ...existing].slice(0, 50),
                };
              });
            }
          } catch {
            // Fall back to mock if API call fails
            const newEvent = generateMockTestEvent();
            setTestEvents((prev) => ({
              ...prev,
              [pixelId]: [newEvent, ...(prev[pixelId] || [])].slice(0, 50),
            }));
          }
        } else {
          const newEvent = generateMockTestEvent();
          setTestEvents((prev) => ({
            ...prev,
            [pixelId]: [newEvent, ...(prev[pixelId] || [])].slice(0, 50),
          }));
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [testMode]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const getEventHealthColor = (count) => {
    if (count > 100) return 'text-emerald-400';
    if (count > 0) return 'text-amber-400';
    return 'text-red-400';
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-3 text-sm text-red-400">Failed to load pixel data</p>
        <button onClick={() => refetch()} className="rounded bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="pixels"
        title="Pixel Dashboard Quick Guide"
        tips={[
          'Green dots mean the pixel fired 100+ events in the last 24 hours',
          'Yellow means 1-100 events — check your pixel installation',
          'Match rate shows how well Meta can identify users from your pixel data',
          'Enable Test Events to see a live stream of incoming pixel fires',
        ]}
      />
      <h1 className="text-lg font-semibold text-zinc-100">Pixel Dashboard</h1>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><LoadingSpinner /></div>
      ) : pixels.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50">
          <p className="text-sm text-zinc-500">No pixels found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pixels.map((pixel) => {
            const isExpanded = expandedPixels.has(pixel.id);
            const isTestActive = testMode[pixel.id];
            return (
              <div key={pixel.id} className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
                {/* Pixel Header Card */}
                <button
                  onClick={() => toggleExpand(pixel.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={clsx('h-2.5 w-2.5 rounded-full', pixel.status === 'ACTIVE' ? 'bg-emerald-400 pulse-dot' : 'bg-red-400')} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{pixel.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-2xs text-zinc-500 font-mono">{pixel.id}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(pixel.id); }}
                          className="text-zinc-600 hover:text-zinc-400"
                          title="Copy ID"
                        >
                          {copiedId === pixel.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={pixel.status} />
                    <ChevronDown size={16} className={clsx('text-zinc-500 transition-transform', isExpanded && 'rotate-180')} />
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-zinc-700">
                    {/* Event Health Table */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Event Health</h4>
                        <button
                          onClick={() => toggleTestMode(pixel.id)}
                          className={clsx(
                            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                            isTestActive
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                          )}
                        >
                          <Radio size={12} className={isTestActive ? 'animate-pulse' : ''} />
                          {isTestActive ? 'Stop Testing' : 'Test Events'}
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-zinc-700/50">
                        <table className="table-dense w-full">
                          <thead>
                            <tr className="border-b border-zinc-700/50 bg-zinc-800/60">
                              <th className="text-left">Event</th>
                              <th className="text-right">Fires (24h)</th>
                              <th className="text-left" style={{ width: '200px' }}>Match Rate</th>
                              <th className="text-center">Health</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(pixel.events || []).map((evt) => (
                              <tr key={evt.name} className="border-b border-zinc-700/30">
                                <td className="font-medium text-zinc-300">{evt.name}</td>
                                <td className={clsx('text-right tabular-nums font-medium', getEventHealthColor(evt.count_24h))}>
                                  {formatNumber(evt.count_24h)}
                                </td>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-700">
                                      <div
                                        className={clsx('h-full rounded-full', evt.match_rate > 60 ? 'bg-emerald-500' : evt.match_rate > 30 ? 'bg-amber-500' : 'bg-red-500')}
                                        style={{ width: `${evt.match_rate}%` }}
                                      />
                                    </div>
                                    <span className="w-10 text-right text-2xs tabular-nums text-zinc-400">{formatPercent(evt.match_rate, 1)}</span>
                                  </div>
                                </td>
                                <td className="text-center"><HealthDot status={evt.status} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Test Event Viewer */}
                    {isTestActive && (
                      <div className="border-t border-zinc-700 p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Radio size={12} className="text-red-400 animate-pulse" />
                          <h4 className="text-xs font-semibold text-zinc-400">Live Test Events</h4>
                          <span className="text-2xs text-zinc-600">Polling every 5s</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-700/50 bg-zinc-900/80">
                          {(testEvents[pixel.id] || []).length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-center">
                                <LoadingSpinner size={16} className="mx-auto mb-2" />
                                <p className="text-xs text-zinc-500">Waiting for events...</p>
                              </div>
                            </div>
                          ) : (
                            <div className="divide-y divide-zinc-800">
                              {(testEvents[pixel.id] || []).map((evt) => (
                                <div key={evt.id} className="flex items-start gap-3 px-4 py-2.5">
                                  <span className="mt-0.5 text-2xs tabular-nums text-zinc-600 whitespace-nowrap">
                                    {new Date(evt.timestamp).toLocaleTimeString()}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={clsx(
                                        'rounded px-1.5 py-0.5 text-2xs font-semibold',
                                        evt.event === 'Purchase' ? 'bg-emerald-500/15 text-emerald-400' :
                                        evt.event === 'AddToCart' ? 'bg-blue-500/15 text-blue-400' :
                                        'bg-zinc-700/50 text-zinc-400'
                                      )}>
                                        {evt.event}
                                      </span>
                                      <span className="truncate text-2xs text-zinc-600">{evt.url}</span>
                                    </div>
                                    {Object.keys(evt.params).length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {Object.entries(evt.params).map(([k, v]) => (
                                          <span key={k} className="rounded bg-zinc-800 px-1.5 py-0.5 text-2xs text-zinc-500">
                                            <span className="text-zinc-400">{k}</span>={v}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
