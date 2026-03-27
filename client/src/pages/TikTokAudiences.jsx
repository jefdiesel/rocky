import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import PageGuide from '../components/common/PageGuide.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import { formatNumber } from '../utils/format.js';
import api from '../services/api.js';

export default function TikTokAudiences() {
  const queryClient = useQueryClient();
  const advertiserId = localStorage.getItem('selected_account_id');
  const [showCreate, setShowCreate] = useState(false);
  const [newAudience, setNewAudience] = useState({ name: '', audience_type: 'CUSTOMER_FILE' });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tiktok-audiences', advertiserId],
    queryFn: async () => {
      const res = await api.tiktok.getAudiences(advertiserId);
      return res.data || [];
    },
  });

  const audiences = data || [];

  const handleCreate = async () => {
    try {
      await api.tiktok.createAudience({
        advertiser_id: advertiserId,
        custom_audience_name: newAudience.name,
        audience_type: newAudience.audience_type,
      });
      setShowCreate(false);
      setNewAudience({ name: '', audience_type: 'CUSTOMER_FILE' });
      queryClient.invalidateQueries({ queryKey: ['tiktok-audiences'] });
    } catch (err) {
      alert('Failed to create audience: ' + (err.message || 'Unknown error'));
    }
  };

  const columns = [
    { key: 'name', accessor: 'name', label: 'Audience Name', sortable: true },
    {
      key: 'type', accessor: 'audience_type', label: 'Type', sortable: true,
      format: (v) => v?.replace(/_/g, ' '),
    },
    {
      key: 'subtype', accessor: 'audience_sub_type', label: 'Subtype',
      format: (v) => v?.replace(/_/g, ' ') || '--',
    },
    { key: 'size', accessor: 'size', label: 'Size', sortable: true, format: (v) => formatNumber(v), align: 'right' },
    {
      key: 'status', accessor: 'status', label: 'Status',
      render: (v) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium ${
          v === 'AVAILABLE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'
        }`}>
          {v || 'Unknown'}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-3 text-sm text-red-400">Failed to load TikTok audiences</p>
        <button onClick={() => refetch()} className="rounded bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="tiktok-audiences"
        title="TikTok Audiences"
        tips={[
          'TikTok supports Custom, DMP, Lookalike, and Engagement audiences',
          'Upload customer lists or create audiences from pixel events',
          'Lookalike audiences find users similar to your best customers',
        ]}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">TikTok Audiences</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> Create Audience
        </button>
      </div>

      <DataTable
        columns={columns}
        data={audiences}
        loading={isLoading}
        rowKey="custom_audience_id"
        emptyMessage="No TikTok audiences found."
      />

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="Create TikTok Audience">
          <div className="space-y-4 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Audience Name</label>
              <input type="text" value={newAudience.name} onChange={(e) => setNewAudience({ ...newAudience, name: e.target.value })}
                className="w-full" placeholder="My Custom Audience" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Type</label>
              <select value={newAudience.audience_type} onChange={(e) => setNewAudience({ ...newAudience, audience_type: e.target.value })} className="w-full">
                <option value="CUSTOMER_FILE">Customer File</option>
                <option value="ENGAGEMENT">Engagement</option>
                <option value="WEBSITE_CUSTOM">Website Custom</option>
                <option value="APP_CUSTOM">App Custom</option>
                <option value="LOOKALIKE">Lookalike</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="rounded-md border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-800">Cancel</button>
              <button onClick={handleCreate} disabled={!newAudience.name} className="rounded-md bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50">Create</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
