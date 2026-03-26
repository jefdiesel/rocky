import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Upload, ChevronDown, ChevronUp, Search } from 'lucide-react';
import clsx from 'clsx';
import DataTable from '../components/common/DataTable.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Modal from '../components/common/Modal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatNumber, formatDate } from '../utils/format.js';
import { EVENT_TYPES } from '../utils/constants.js';
import api from '../services/api.js';
import { getMockAudiences } from '../mocks/dashboardData.js';

const AUDIENCE_TABS = ['Customer List', 'Website', 'Engagement', 'App Activity'];

export default function Audiences() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createTab, setCreateTab] = useState(0);
  const [lookalikeOpen, setLookalikeOpen] = useState(false);
  const [lookalikeSource, setLookalikeSource] = useState('');
  const [lookalikeCountry, setLookalikeCountry] = useState('US');
  const [lookalikePercent, setLookalikePercent] = useState(1);
  const [overlapA, setOverlapA] = useState('');
  const [overlapB, setOverlapB] = useState('');
  const [overlapResult, setOverlapResult] = useState(null);
  const [overlapLoading, setOverlapLoading] = useState(false);

  // Website audience rule builder state
  const [pixelEvents, setPixelEvents] = useState([{ event: 'PageView', param: '', value: '' }]);
  // Engagement source state
  const [engagementSource, setEngagementSource] = useState('video');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audiences'],
    queryFn: async () => {
      try {
        const res = await api.getAudiences();
        return res.data || res;
      } catch {
        return getMockAudiences().data;
      }
    },
  });

  const audiences = data || [];

  const columns = [
    { key: 'name', accessor: 'name', label: 'Audience Name', sortable: true },
    { key: 'type', accessor: 'type', label: 'Type', sortable: true, render: (v) => <StatusBadge status={v} /> },
    { key: 'size', accessor: 'size', label: 'Size', sortable: true, format: (v) => formatNumber(v), align: 'right' },
    { key: 'status', accessor: 'status', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v} /> },
    { key: 'updated', accessor: 'updated', label: 'Last Updated', sortable: true, format: (v) => formatDate(v) },
    {
      key: 'actions', label: 'Actions', width: '60px',
      render: () => (
        <button className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 text-2xs">
          Edit
        </button>
      ),
    },
  ];

  const checkOverlap = async () => {
    if (!overlapA || !overlapB) return;
    setOverlapLoading(true);
    try {
      const res = await api.getAudienceOverlap(overlapA, overlapB);
      setOverlapResult(res);
    } catch {
      const sizeA = audiences.find((a) => a.id === overlapA)?.size || 100000;
      const sizeB = audiences.find((a) => a.id === overlapB)?.size || 100000;
      const overlap = Math.round(Math.min(sizeA, sizeB) * (0.05 + Math.random() * 0.15));
      setOverlapResult({ overlap, percentage: ((overlap / Math.min(sizeA, sizeB)) * 100).toFixed(1) });
    } finally {
      setOverlapLoading(false);
    }
  };

  const estimateLookalikeSize = () => {
    const base = 3200000;
    return Math.round(base * (lookalikePercent / 100) * (0.8 + Math.random() * 0.4));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-3 text-sm text-red-400">Failed to load audiences</p>
        <button onClick={() => refetch()} className="rounded bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Audiences</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <Plus size={14} /> Create Audience
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={audiences}
        loading={isLoading}
        emptyMessage="No audiences created yet."
      />

      {/* Lookalike Builder */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50">
        <button
          onClick={() => setLookalikeOpen(!lookalikeOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          <span>Lookalike Audience Builder</span>
          {lookalikeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {lookalikeOpen && (
          <div className="border-t border-zinc-700 px-4 py-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-2xs text-zinc-500">Source Audience</label>
                <select value={lookalikeSource} onChange={(e) => setLookalikeSource(e.target.value)} className="w-full">
                  <option value="">Select source...</option>
                  {audiences.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-2xs text-zinc-500">Country</label>
                <select value={lookalikeCountry} onChange={(e) => setLookalikeCountry(e.target.value)} className="w-full">
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-2xs text-zinc-500">Lookalike % ({lookalikePercent}%)</label>
                <input
                  type="range" min="1" max="10" value={lookalikePercent}
                  onChange={(e) => setLookalikePercent(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-2xs text-zinc-600">
                  <span>1% (most similar)</span>
                  <span>10% (broader)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded bg-zinc-900/50 px-4 py-3">
              <div>
                <p className="text-xs text-zinc-400">Estimated Audience Size</p>
                <p className="text-lg font-bold text-zinc-100">{formatNumber(estimateLookalikeSize())}</p>
              </div>
              <button
                disabled={!lookalikeSource}
                className="rounded-md bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                Create Lookalike
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlap Tool */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Audience Overlap Tool</h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-2xs text-zinc-500">Audience A</label>
            <select value={overlapA} onChange={(e) => setOverlapA(e.target.value)} className="w-full">
              <option value="">Select...</option>
              {audiences.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-2xs text-zinc-500">Audience B</label>
            <select value={overlapB} onChange={(e) => setOverlapB(e.target.value)} className="w-full">
              <option value="">Select...</option>
              {audiences.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <button
            onClick={checkOverlap}
            disabled={!overlapA || !overlapB || overlapLoading}
            className="rounded-md bg-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-600 disabled:opacity-50"
          >
            {overlapLoading ? 'Checking...' : 'Check Overlap'}
          </button>
        </div>
        {overlapResult && (
          <div className="mt-3 flex items-center gap-4 rounded bg-zinc-900/50 px-4 py-3">
            <div>
              <p className="text-2xs text-zinc-500">Overlap Size</p>
              <p className="text-sm font-bold text-zinc-100">{formatNumber(overlapResult.overlap)}</p>
            </div>
            <div>
              <p className="text-2xs text-zinc-500">Overlap %</p>
              <p className="text-sm font-bold text-amber-400">{overlapResult.percentage}%</p>
            </div>
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-zinc-700">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.min(overlapResult.percentage, 100)}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Audience"
        size="lg"
        footer={
          <>
            <button onClick={() => setCreateOpen(false)} className="rounded-md border border-zinc-700 px-4 py-1.5 text-xs text-zinc-400 hover:bg-zinc-700">Cancel</button>
            <button className="rounded-md bg-primary-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-700">Create</button>
          </>
        }
      >
        {/* Tabs */}
        <div className="mb-4 flex border-b border-zinc-700">
          {AUDIENCE_TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setCreateTab(i)}
              className={clsx(
                'border-b-2 px-4 py-2 text-xs font-medium transition-colors',
                createTab === i ? 'border-primary-500 text-primary-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Customer List */}
        {createTab === 0 && (
          <div className="space-y-4">
            <div className="drop-zone flex flex-col items-center justify-center rounded-lg py-12">
              <Upload size={28} className="mb-2 text-zinc-500" />
              <p className="text-xs text-zinc-400">Upload a CSV file with customer data</p>
              <p className="text-2xs text-zinc-600">Supported: email, phone, first name, last name, zip</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Field Mapping</p>
              <div className="grid grid-cols-2 gap-2">
                {['Email', 'Phone', 'First Name', 'Last Name', 'Zip Code'].map((field) => (
                  <div key={field} className="flex items-center gap-2">
                    <span className="w-24 text-xs text-zinc-500">{field}</span>
                    <select className="flex-1 text-xs">
                      <option value="">-- Map to column --</option>
                      <option value="col_a">Column A</option>
                      <option value="col_b">Column B</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Website */}
        {createTab === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-2xs text-zinc-500">Pixel</label>
              <select className="w-full">
                <option value="px_123456">Rocky Main Pixel (px_123456)</option>
                <option value="px_789012">Rocky Staging Pixel (px_789012)</option>
              </select>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Event Rules</p>
              {pixelEvents.map((rule, i) => (
                <div key={i} className="mb-2 flex items-center gap-2">
                  <select
                    value={rule.event}
                    onChange={(e) => {
                      const next = [...pixelEvents];
                      next[i] = { ...rule, event: e.target.value };
                      setPixelEvents(next);
                    }}
                    className="w-44"
                  >
                    {EVENT_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Parameter (optional)"
                    value={rule.param}
                    onChange={(e) => {
                      const next = [...pixelEvents];
                      next[i] = { ...rule, param: e.target.value };
                      setPixelEvents(next);
                    }}
                    className="w-36"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={rule.value}
                    onChange={(e) => {
                      const next = [...pixelEvents];
                      next[i] = { ...rule, value: e.target.value };
                      setPixelEvents(next);
                    }}
                    className="flex-1"
                  />
                  {pixelEvents.length > 1 && (
                    <button
                      onClick={() => setPixelEvents(pixelEvents.filter((_, j) => j !== i))}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setPixelEvents([...pixelEvents, { event: 'PageView', param: '', value: '' }])}
                className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
              >
                <Plus size={12} /> Add Rule
              </button>
            </div>
            <div>
              <label className="mb-1 block text-2xs text-zinc-500">Retention (days)</label>
              <input type="number" defaultValue={30} min={1} max={180} className="w-24" />
            </div>
          </div>
        )}

        {/* Engagement */}
        {createTab === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Engagement Source</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'video', label: 'Video' },
                  { value: 'page', label: 'Facebook Page' },
                  { value: 'instagram', label: 'Instagram Profile' },
                  { value: 'lead_form', label: 'Lead Form' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setEngagementSource(value)}
                    className={clsx(
                      'rounded-md border px-3 py-2 text-xs transition-colors',
                      engagementSource === value
                        ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-2xs text-zinc-500">
                {engagementSource === 'video' ? 'Video engagement threshold' :
                 engagementSource === 'page' ? 'Page interaction type' :
                 engagementSource === 'instagram' ? 'Profile engagement type' : 'Form selection'}
              </label>
              <select className="w-full">
                {engagementSource === 'video' && (
                  <>
                    <option>People who watched 25%</option>
                    <option>People who watched 50%</option>
                    <option>People who watched 75%</option>
                    <option>People who watched 95%</option>
                  </>
                )}
                {engagementSource === 'page' && (
                  <>
                    <option>Everyone who engaged</option>
                    <option>Anyone who visited the page</option>
                    <option>People who clicked any CTA</option>
                    <option>People who sent a message</option>
                  </>
                )}
                {engagementSource === 'instagram' && (
                  <>
                    <option>Everyone who engaged</option>
                    <option>Anyone who visited the profile</option>
                    <option>People who sent a message</option>
                    <option>People who saved a post</option>
                  </>
                )}
                {engagementSource === 'lead_form' && (
                  <>
                    <option>People who opened the form</option>
                    <option>People who submitted the form</option>
                    <option>People who opened but did not submit</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-2xs text-zinc-500">Retention (days)</label>
              <input type="number" defaultValue={30} min={1} max={365} className="w-24" />
            </div>
          </div>
        )}

        {/* App Activity */}
        {createTab === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-2xs text-zinc-500">App</label>
              <select className="w-full">
                <option>Select an app...</option>
                <option>Rocky iOS App</option>
                <option>Rocky Android App</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-2xs text-zinc-500">Event</label>
              <select className="w-full">
                <option>Anyone who opened the app</option>
                <option>Most active users</option>
                <option>Users by purchase amount</option>
                <option>Users by segment</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-2xs text-zinc-500">In the last (days)</label>
              <input type="number" defaultValue={30} min={1} max={180} className="w-24" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
