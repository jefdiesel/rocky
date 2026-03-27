import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pause, Play, Trash2, Edit } from 'lucide-react';
import PageGuide from '../components/common/PageGuide.jsx';
import DataTable from '../components/common/DataTable.jsx';
import { formatCurrency, formatNumber } from '../utils/format.js';
import { mapTTStatus } from '../utils/tiktokConstants.js';
import api from '../services/api.js';

function TTStatusBadge({ status }) {
  const { label, color } = mapTTStatus(status);
  const colors = {
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    red: 'bg-red-500/15 text-red-400',
    zinc: 'bg-zinc-500/15 text-zinc-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium ${colors[color] || colors.zinc}`}>
      {label}
    </span>
  );
}

export default function TikTokCampaigns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRows, setSelectedRows] = useState([]);

  const advertiserId = localStorage.getItem('selected_account_id');

  const handleToggleStatus = async (campaign) => {
    const newStatus = campaign.operation_status === 'ENABLE' ? 'DISABLE' : 'ENABLE';
    try {
      await api.tiktok.updateCampaign(campaign.campaign_id, {
        advertiser_id: advertiserId,
        operation_status: newStatus,
      });
      queryClient.invalidateQueries({ queryKey: ['tiktok-campaigns'] });
    } catch (err) {
      alert('Failed to update: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (campaign) => {
    if (!confirm(`Delete campaign "${campaign.campaign_name}"?`)) return;
    try {
      await api.tiktok.deleteCampaign(campaign.campaign_id, { advertiser_id: advertiserId });
      queryClient.invalidateQueries({ queryKey: ['tiktok-campaigns'] });
    } catch (err) {
      alert('Failed to delete: ' + (err.message || 'Unknown error'));
    }
  };

  const handleBulkPause = async () => {
    for (const id of selectedRows) {
      try { await api.tiktok.updateCampaign(id, { advertiser_id: advertiserId, operation_status: 'DISABLE' }); } catch {}
    }
    setSelectedRows([]);
    queryClient.invalidateQueries({ queryKey: ['tiktok-campaigns'] });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedRows.length} campaigns?`)) return;
    for (const id of selectedRows) {
      try { await api.tiktok.deleteCampaign(id, { advertiser_id: advertiserId }); } catch {}
    }
    setSelectedRows([]);
    queryClient.invalidateQueries({ queryKey: ['tiktok-campaigns'] });
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tiktok-campaigns', advertiserId],
    queryFn: async () => {
      const res = await api.tiktok.getCampaigns(advertiserId);
      return res.data || [];
    },
  });

  const campaigns = data || [];
  const filtered = statusFilter === 'ALL'
    ? campaigns
    : campaigns.filter((c) => c.operation_status === statusFilter);

  const columns = [
    {
      key: 'status', accessor: 'operation_status', label: 'Status', sortable: true, width: '90px',
      render: (v) => <TTStatusBadge status={v} />,
    },
    { key: 'name', accessor: 'campaign_name', label: 'Campaign Name', sortable: true },
    {
      key: 'objective', accessor: 'objective_type', label: 'Objective', sortable: true,
      format: (v) => v?.replace(/_/g, ' '),
    },
    {
      key: 'budget', accessor: 'budget', label: 'Budget', sortable: true,
      format: (v) => v ? formatCurrency(v) + '/d' : '--', align: 'right',
    },
    { key: 'spend', accessor: 'spend', label: 'Spend', sortable: true, format: (v) => formatCurrency(v), align: 'right' },
    { key: 'clicks', accessor: 'clicks', label: 'Clicks', sortable: true, format: (v) => formatNumber(v), align: 'right' },
    { key: 'conversions', accessor: 'conversions', label: 'Conversions', sortable: true, format: (v) => formatNumber(v), align: 'right' },
    { key: 'cpa', accessor: 'cpa', label: 'CPA', sortable: true, format: (v) => formatCurrency(v), align: 'right' },
    {
      key: 'actions', label: 'Actions', width: '80px',
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => navigate(`/tiktok/campaigns/${row.campaign_id}/edit`)} className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300" title="Edit">
            <Edit size={13} />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
            title={row.operation_status === 'ENABLE' ? 'Pause' : 'Activate'}
          >
            {row.operation_status === 'ENABLE' ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button onClick={() => handleDelete(row)} className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-red-400" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  const adGroupColumns = [
    { key: 'status', accessor: 'operation_status', label: 'Status', render: (v) => <TTStatusBadge status={v} /> },
    { key: 'name', accessor: 'adgroup_name', label: 'Ad Group Name' },
    { key: 'budget', accessor: 'budget', label: 'Budget', format: (v) => formatCurrency(v), align: 'right' },
    { key: 'spend', accessor: 'spend', label: 'Spend', format: (v) => formatCurrency(v), align: 'right' },
    { key: 'clicks', accessor: 'clicks', label: 'Clicks', format: (v) => formatNumber(v), align: 'right' },
  ];

  const adColumns = [
    { key: 'status', accessor: 'operation_status', label: 'Status', render: (v) => <TTStatusBadge status={v} /> },
    { key: 'name', accessor: 'ad_name', label: 'Ad Name' },
    { key: 'spend', accessor: 'spend', label: 'Spend', format: (v) => formatCurrency(v), align: 'right' },
    { key: 'clicks', accessor: 'clicks', label: 'Clicks', format: (v) => formatNumber(v), align: 'right' },
  ];

  const renderExpanded = (campaign) => {
    if (!campaign.ad_groups?.length) {
      return <div className="px-8 py-4 text-xs text-zinc-500">No ad groups in this campaign</div>;
    }
    return (
      <div className="pl-10 pr-4 py-2">
        <DataTable
          columns={adGroupColumns}
          data={campaign.ad_groups}
          expandable={true}
          renderExpanded={(ag) => {
            if (!ag.ads?.length) {
              return <div className="px-8 py-3 text-xs text-zinc-500">No ads in this ad group</div>;
            }
            return (
              <div className="pl-10 pr-4 py-2">
                <DataTable columns={adColumns} data={ag.ads} />
              </div>
            );
          }}
        />
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-3 text-sm text-red-400">Failed to load TikTok campaigns</p>
        <button onClick={() => refetch()} className="rounded bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="tiktok-campaigns"
        title="TikTok Campaigns"
        tips={[
          'Click any row to expand and see its ad groups and ads',
          'TikTok uses "Ad Groups" instead of Meta\'s "Ad Sets"',
          'Spark Ads let you boost organic TikTok posts as ads',
        ]}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">TikTok Campaigns</h1>
        <button
          onClick={() => navigate('/tiktok/campaigns/new')}
          className="flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> New Campaign
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ENABLE">Active</option>
            <option value="DISABLE">Paused</option>
            <option value="DELETE">Deleted</option>
          </select>
          <span className="text-2xs text-zinc-500">{filtered.length} campaigns</span>
        </div>
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5">
            <span className="text-xs text-zinc-400">{selectedRows.length} selected</span>
            <button onClick={handleBulkPause} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-amber-400 hover:bg-zinc-700">
              <Pause size={12} /> Pause
            </button>
            <button onClick={handleBulkDelete} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-400 hover:bg-zinc-700">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        expandable
        renderExpanded={renderExpanded}
        rowKey="campaign_id"
        emptyMessage="No TikTok campaigns found. Create your first campaign to get started."
      />
    </div>
  );
}
