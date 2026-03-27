import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Save, Check, Send, Trash2, Plus, RefreshCw, Clock, AlertTriangle, X,
  Bot, Radio, Link2,
} from 'lucide-react';
import clsx from 'clsx';
import PageGuide from '../components/common/PageGuide.jsx';
import DataTable from '../components/common/DataTable.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';
import { useBotConfig, useAlertHistory, useSnoozeState, useRedtrackMappings, useTelegramStatus } from '../hooks/useRedtrack.js';
import api from '../services/api.js';

export default function BotSettings() {
  const queryClient = useQueryClient();
  const { data: config } = useBotConfig();
  const { data: alerts } = useAlertHistory();
  const { data: snoozes } = useSnoozeState();
  const { data: mappings } = useRedtrackMappings();
  const { data: tgStatus } = useTelegramStatus();

  const [telegramToken, setTelegramToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [redtrackKey, setRedtrackKey] = useState('');
  const [roiThreshold, setRoiThreshold] = useState(25);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Mapping form
  const [newRTName, setNewRTName] = useState('');
  const [newMetaId, setNewMetaId] = useState('');
  const [newMetaName, setNewMetaName] = useState('');

  // Load config into form on first render
  useState(() => {
    if (config) {
      setChatId(config.telegram_chat_id || '');
      setRoiThreshold(config.roi_threshold || 25);
    }
  });

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const data = { roi_threshold: roiThreshold };
      if (telegramToken) data.telegram_token = telegramToken;
      if (chatId) data.telegram_chat_id = chatId;
      if (redtrackKey) data.redtrack_api_key = redtrackKey;
      await api.saveBotConfig(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['bot-config'] });
    } catch (err) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    }
    setSaving(false);
  };

  const handleTestAlert = async () => {
    try {
      await api.testTelegram();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (err) {
      alert('Test failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncRedtrack();
      queryClient.invalidateQueries({ queryKey: ['redtrack-campaigns'] });
    } catch (err) {
      alert('Sync failed: ' + (err.message || 'Unknown error'));
    }
    setSyncing(false);
  };

  const handleAddMapping = async () => {
    if (!newRTName || !newMetaId) return;
    try {
      await api.createRedtrackMapping({
        redtrack_campaign_name: newRTName,
        meta_campaign_id: newMetaId,
        meta_campaign_name: newMetaName,
      });
      setNewRTName('');
      setNewMetaId('');
      setNewMetaName('');
      queryClient.invalidateQueries({ queryKey: ['redtrack-mappings'] });
    } catch (err) {
      alert('Failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteMapping = async (id) => {
    try {
      await api.deleteRedtrackMapping(id);
      queryClient.invalidateQueries({ queryKey: ['redtrack-mappings'] });
    } catch {}
  };

  const handleCancelSnooze = async (campaignId) => {
    try {
      await api.cancelSnooze(campaignId);
      queryClient.invalidateQueries({ queryKey: ['snooze-state'] });
    } catch {}
  };

  const alertColumns = [
    { key: 'created_at', accessor: 'created_at', label: 'Time', format: (v) => v ? new Date(v).toLocaleString() : '--' },
    { key: 'campaign_name', accessor: 'campaign_name', label: 'Campaign' },
    {
      key: 'roi', accessor: 'roi', label: 'ROI', align: 'right',
      render: (v) => (
        <span className={clsx('font-medium', v < 0 ? 'text-red-400' : v < 25 ? 'text-amber-400' : 'text-emerald-400')}>
          {v != null ? `${v.toFixed(1)}%` : '--'}
        </span>
      ),
    },
    {
      key: 'action', accessor: 'action', label: 'Action',
      render: (v) => (
        <span className={clsx(
          'rounded-full px-2 py-0.5 text-2xs font-medium',
          v === 'paused' ? 'bg-red-500/15 text-red-400' :
          v === 'snoozed' ? 'bg-amber-500/15 text-amber-400' :
          v === 'ignored' ? 'bg-zinc-500/15 text-zinc-400' :
          'bg-blue-500/15 text-blue-400'
        )}>
          {v || 'pending'}
        </span>
      ),
    },
  ];

  const mappingColumns = [
    { key: 'redtrack_campaign_name', accessor: 'redtrack_campaign_name', label: 'RedTrack Campaign' },
    { key: 'meta_campaign_id', accessor: 'meta_campaign_id', label: 'Meta Campaign ID' },
    { key: 'meta_campaign_name', accessor: 'meta_campaign_name', label: 'Meta Campaign Name' },
    {
      key: 'actions', label: '', width: '40px',
      render: (_, row) => (
        <button onClick={() => handleDeleteMapping(row.id)} className="rounded p-1 text-zinc-600 hover:text-red-400">
          <Trash2 size={13} />
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageGuide
        pageKey="bot-settings"
        title="Bot Settings"
        tips={[
          'Connect Telegram to get ROI alerts directly in your chat',
          'RedTrack data syncs every 15 minutes automatically',
          'Map RedTrack campaigns to Meta campaigns for unified tracking',
          'Set your ROI threshold — alerts fire when a campaign drops below it',
        ]}
      />
      <h1 className="text-lg font-semibold text-zinc-100">Bot & Tracking Settings</h1>

      {/* Telegram Connection */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
            <Bot size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Telegram Bot</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={clsx(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium',
                tgStatus?.connected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'
              )}>
                <Radio size={8} /> {tgStatus?.connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-2xs text-zinc-500">Bot Token</label>
            <input type="password" value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)}
              placeholder={config?.telegram_token_set ? '••••••••••• (set)' : 'Paste bot token'}
              className="w-full font-mono text-xs" />
          </div>
          <div>
            <label className="mb-1 block text-2xs text-zinc-500">Chat ID</label>
            <input type="text" value={chatId} onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g., -1001234567890" className="w-full font-mono text-xs" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={handleTestAlert}
            className={clsx('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              testSent ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600')}>
            {testSent ? <><Check size={13} /> Sent</> : <><Send size={13} /> Send Test Alert</>}
          </button>
        </div>
      </div>

      {/* RedTrack */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/15">
            <Link2 size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">RedTrack</h3>
            <p className="text-2xs text-zinc-500">Revenue tracking and ROI attribution</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-2xs text-zinc-500">API Key</label>
            <input type="password" value={redtrackKey} onChange={(e) => setRedtrackKey(e.target.value)}
              placeholder={config?.redtrack_api_key_set ? '••••••••••• (set)' : 'Paste RedTrack API key'}
              className="w-full font-mono text-xs" />
          </div>
          <div>
            <label className="mb-1 block text-2xs text-zinc-500">ROI Alert Threshold (%)</label>
            <input type="number" value={roiThreshold} onChange={(e) => setRoiThreshold(Number(e.target.value))}
              className="w-full" min="0" max="100" />
            <p className="mt-0.5 text-2xs text-zinc-600">Alert when campaign ROI drops below this</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 rounded-md bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-600">
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSaveConfig} disabled={saving}
          className={clsx('flex items-center gap-1.5 rounded-md px-5 py-2 text-sm font-medium transition-colors',
            saved ? 'bg-emerald-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700')}>
          {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Configuration</>}
        </button>
      </div>

      {/* Campaign Mapping */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Campaign Mapping</h3>
        <p className="mb-3 text-2xs text-zinc-500">Map RedTrack campaign names to Meta campaign IDs for unified reporting</p>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input type="text" value={newRTName} onChange={(e) => setNewRTName(e.target.value)}
            placeholder="RedTrack campaign name" className="flex-1 text-xs" />
          <input type="text" value={newMetaId} onChange={(e) => setNewMetaId(e.target.value)}
            placeholder="Meta campaign ID" className="flex-1 text-xs font-mono" />
          <input type="text" value={newMetaName} onChange={(e) => setNewMetaName(e.target.value)}
            placeholder="Meta name (optional)" className="flex-1 text-xs" />
          <button onClick={handleAddMapping} disabled={!newRTName || !newMetaId}
            className="flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50">
            <Plus size={13} /> Add
          </button>
        </div>

        <DataTable columns={mappingColumns} data={mappings || []} rowKey="id" emptyMessage="No mappings configured" />
      </div>

      {/* Alert History */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Alert History</h3>
        <DataTable columns={alertColumns} data={alerts || []} rowKey="id" emptyMessage="No alerts yet" />
      </div>

      {/* Snooze Management */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Snoozed Campaigns</h3>
        {(!snoozes || snoozes.length === 0) ? (
          <p className="text-xs text-zinc-500">No campaigns currently snoozed</p>
        ) : (
          <div className="space-y-2">
            {snoozes.map((s) => (
              <div key={s.campaign_id} className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 p-3">
                <div>
                  <p className="text-xs font-medium text-zinc-200">{s.campaign_name || s.campaign_id}</p>
                  <p className="flex items-center gap-1 text-2xs text-zinc-500">
                    <Clock size={10} /> Until {new Date(s.snoozed_until).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => handleCancelSnooze(s.campaign_id)}
                  className="rounded p-1.5 text-zinc-500 hover:bg-zinc-700 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
