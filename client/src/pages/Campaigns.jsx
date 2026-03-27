import { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pause, Play, Trash2, MoreHorizontal, Edit } from 'lucide-react';
import PageGuide from '../components/common/PageGuide.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataTable from '../components/common/DataTable.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatCurrency, formatNumber } from '../utils/format.js';
import api from '../services/api.js';
import { getMockCampaigns } from '../mocks/dashboardData.js';

export default function Campaigns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRows, setSelectedRows] = useState([]);

  const handleToggleStatus = async (campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.updateCampaign(campaign.id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch (err) {
      alert('Failed to update: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (campaign) => {
    if (!confirm(`Delete campaign "${campaign.name}"?`)) return;
    try {
      await api.deleteCampaign(campaign.id);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch (err) {
      alert('Failed to delete: ' + (err.message || 'Unknown error'));
    }
  };

  const handleBulkPause = async () => {
    for (const id of selectedRows) {
      try { await api.updateCampaign(id, { status: 'PAUSED' }); } catch {}
    }
    setSelectedRows([]);
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedRows.length} campaigns?`)) return;
    for (const id of selectedRows) {
      try { await api.deleteCampaign(id); } catch {}
    }
    setSelectedRows([]);
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      try {
        const res = await api.getCampaigns();
        return res.data || [];
      } catch (err) {
        if (!localStorage.getItem('auth_token') && !localStorage.getItem('meta_token')) return getMockCampaigns().data;
        if (err.status === 401) throw err;
        console.warn('[campaigns]', err.message);
        return [];
      }
    },
  });

  const campaigns = data || [];
  const filtered = statusFilter === 'ALL' ? campaigns : campaigns.filter((c) => c.status === statusFilter);

  const columns = [
    {
      key: 'status', accessor: 'status', label: 'Status', sortable: true, width: '90px',
      render: (v) => <StatusBadge status={v} />,
    },
    { key: 'name', accessor: 'name', label: 'Campaign Name', sortable: true },
    {
      key: 'objective', accessor: 'objective', label: 'Objective', sortable: true,
      format: (v) => v?.replace('OUTCOME_', '').replace(/_/g, ' '),
    },
    {
      key: 'daily_budget', label: 'Budget', sortable: true,
      accessor: (row) => {
        if (row.daily_budget && row.daily_budget !== '0') return row.daily_budget;
        if (row.lifetime_budget && row.lifetime_budget !== '0') return row.lifetime_budget;
        const adset = row.adsets?.[0];
        if (adset?.daily_budget && adset.daily_budget !== '0') return adset.daily_budget;
        if (adset?.lifetime_budget && adset.lifetime_budget !== '0') return adset.lifetime_budget;
        return null;
      },
      format: (v) => v ? formatCurrency(v / 100) + '/d' : '--', align: 'right',
    },
    { key: 'spend', accessor: 'spend', label: 'Spend', sortable: true, format: (v) => formatCurrency(v), align: 'right' },
    { key: 'results', accessor: 'results', label: 'Results', sortable: true, format: (v) => formatNumber(v), align: 'right' },
    { key: 'cpa', accessor: 'cpa', label: 'CPA', sortable: true, format: (v) => formatCurrency(v), align: 'right' },
    { key: 'roas', accessor: 'roas', label: 'ROAS', sortable: true, format: (v) => (v != null ? v.toFixed(2) : '0.00') + 'x', align: 'right' },
    {
      key: 'actions', label: 'Actions', width: '80px',
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => navigate(`/campaigns/${row.id}/edit`)} className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300" title="Edit">
            <Edit size={13} />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
            title={row.status === 'ACTIVE' ? 'Pause' : 'Activate'}
          >
            {row.status === 'ACTIVE' ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button onClick={() => handleDelete(row)} className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-red-400" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  const adSetColumns = [
    { key: 'status', accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'name', accessor: 'name', label: 'Ad Set Name' },
    { key: 'daily_budget', accessor: 'daily_budget', label: 'Budget', format: (v) => formatCurrency(v), align: 'right' },
    { key: 'spend', accessor: 'spend', label: 'Spend', format: (v) => formatCurrency(v), align: 'right' },
    { key: 'results', accessor: 'results', label: 'Results', format: (v) => formatNumber(v), align: 'right' },
    { key: 'cpa', accessor: 'cpa', label: 'CPA', format: (v) => formatCurrency(v), align: 'right' },
  ];

  const adColumns = [
    { key: 'status', accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'name', accessor: 'name', label: 'Ad Name' },
    { key: 'spend', accessor: 'spend', label: 'Spend', format: (v) => formatCurrency(v), align: 'right' },
    { key: 'results', accessor: 'results', label: 'Results', format: (v) => formatNumber(v), align: 'right' },
    { key: 'cpa', accessor: 'cpa', label: 'CPA', format: (v) => formatCurrency(v), align: 'right' },
  ];

  const renderExpanded = (campaign) => {
    if (!campaign.adsets?.length) {
      return <div className="px-8 py-4 text-xs text-zinc-500">No ad sets in this campaign</div>;
    }
    return (
      <div className="pl-10 pr-4 py-2">
        <DataTable
          columns={adSetColumns}
          data={campaign.adsets}
          expandable={true}
          renderExpanded={(adset) => {
            if (!adset.ads?.length) {
              return <div className="px-8 py-3 text-xs text-zinc-500">No ads in this ad set</div>;
            }
            return (
              <div className="pl-10 pr-4 py-2">
                <DataTable columns={adColumns} data={adset.ads} />
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
        <p className="mb-3 text-sm text-red-400">Failed to load campaigns</p>
        <button onClick={() => refetch()} className="rounded bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="campaigns"
        title="Campaigns Quick Guide"
        tips={[
          'Click any row to expand and see its ad sets and ads',
          'Use the status filter to focus on active, paused, or deleted campaigns',
          'Select multiple rows for bulk pause or delete actions',
          "Click 'New Campaign' to launch the step-by-step campaign builder",
        ]}
      />
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Campaigns</h1>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {/* Filters + Bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="DELETED">Deleted</option>
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

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        expandable
        renderExpanded={renderExpanded}
        rowKey="id"
        emptyMessage="No campaigns found. Create your first campaign to get started."
      />
    </div>
  );
}
