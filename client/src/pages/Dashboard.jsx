import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import KPICard from '../components/common/KPICard.jsx';
import DataTable from '../components/common/DataTable.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format.js';
import {
  useInsights, useTimeSeries, useCampaignBreakdown,
  usePlatformSplit, usePlacementBreakdown, useFrequencyData, usePacingData,
} from '../hooks/useInsights.js';

export default function Dashboard() {
  const { dateRange } = useOutletContext();
  const { dateParams } = dateRange;

  const { data: kpis, isLoading: kpisLoading } = useInsights(dateParams);
  const { data: timeSeries, isLoading: tsLoading } = useTimeSeries(dateParams);
  const { data: breakdown, isLoading: bdLoading } = useCampaignBreakdown(dateParams);
  const { data: platform, isLoading: plLoading } = usePlatformSplit(dateParams);
  const { data: placements, isLoading: pmLoading } = usePlacementBreakdown(dateParams);
  const { data: frequency, isLoading: freqLoading } = useFrequencyData(dateParams);
  const { data: pacing, isLoading: pacingLoading } = usePacingData();

  const [breakdownLevel, setBreakdownLevel] = useState('campaign');

  const kpiCards = kpis ? [
    { label: 'Total Spend', value: formatCurrency(kpis.spend), trend: kpis.spendTrend },
    { label: 'Impressions', value: formatNumber(kpis.impressions), trend: kpis.impressionsTrend },
    { label: 'Reach', value: formatNumber(kpis.reach), trend: kpis.reachTrend },
    { label: 'CPM', value: formatCurrency(kpis.cpm), trend: kpis.cpmTrend },
    { label: 'CTR', value: formatPercent(kpis.ctr), trend: kpis.ctrTrend },
    { label: 'CPC', value: formatCurrency(kpis.cpc), trend: kpis.cpcTrend },
    { label: 'Conversions', value: formatNumber(kpis.conversions), trend: kpis.conversionsTrend },
    { label: 'CPA', value: formatCurrency(kpis.cpa), trend: kpis.cpaTrend },
    { label: 'ROAS', value: (kpis.roas != null ? kpis.roas.toFixed(2) : '0.00') + 'x', trend: kpis.roasTrend },
  ] : [];

  const breakdownColumns = [
    { key: 'name', accessor: 'name', label: 'Name', sortable: true },
    { key: 'objective', accessor: 'objective', label: 'Objective', sortable: true },
    { key: 'status', accessor: 'status', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v} /> },
    { key: 'spend', accessor: 'spend', label: 'Spend', sortable: true, format: (v) => formatCurrency(v), align: 'right' },
    { key: 'impressions', accessor: 'impressions', label: 'Impr.', sortable: true, format: (v) => formatNumber(v), align: 'right' },
    { key: 'clicks', accessor: 'clicks', label: 'Clicks', sortable: true, format: (v) => formatNumber(v), align: 'right' },
    { key: 'ctr', accessor: 'ctr', label: 'CTR', sortable: true, format: (v) => formatPercent(v), align: 'right' },
    { key: 'conversions', accessor: 'conversions', label: 'Conv.', sortable: true, format: (v) => formatNumber(v), align: 'right' },
    { key: 'cpa', accessor: 'cpa', label: 'CPA', sortable: true, format: (v) => formatCurrency(v), align: 'right' },
    { key: 'roas', accessor: 'roas', label: 'ROAS', sortable: true, format: (v) => (v != null ? v.toFixed(2) : '0.00') + 'x', align: 'right' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 shadow-lg">
        <p className="mb-1 text-xs font-medium text-zinc-300">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: {p.name === 'Spend' ? formatCurrency(p.value) : formatNumber(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-5 xl:grid-cols-9">
        {kpisLoading
          ? Array.from({ length: 9 }).map((_, i) => <KPICard key={i} loading />)
          : kpiCards.map((kpi, i) => <KPICard key={i} {...kpi} />)
        }
      </div>

      {/* Time Series Chart */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Spend vs Conversions Over Time</h3>
        {tsLoading ? (
          <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeSeries?.data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#71717a' }} />
              <YAxis yAxisId="spend" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => '$' + formatNumber(v)} />
              <YAxis yAxisId="conv" orientation="right" tick={{ fontSize: 11, fill: '#71717a' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="spend" type="monotone" dataKey="spend" name="Spend" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line yAxisId="conv" type="monotone" dataKey="conversions" name="Conversions" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Breakdown + Charts Row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Platform Split */}
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Platform Split</h3>
          {plLoading ? (
            <div className="flex h-48 items-center justify-center"><LoadingSpinner /></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={platform?.data || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(platform?.data || []).map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Placement Breakdown */}
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4 xl:col-span-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Placement Breakdown</h3>
          {pmLoading ? (
            <div className="flex h-48 items-center justify-center"><LoadingSpinner /></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={placements?.data || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => '$' + formatNumber(v)} />
                <YAxis type="category" dataKey="placement" tick={{ fontSize: 11, fill: '#a1a1aa' }} width={120} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', fontSize: 12, color: '#e4e4e7' }} />
                <Bar dataKey="spend" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Campaign Breakdown Table */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Performance Breakdown</h3>
          <div className="flex rounded-md border border-zinc-700 bg-zinc-900">
            {['campaign', 'adset', 'ad'].map((level) => (
              <button
                key={level}
                onClick={() => setBreakdownLevel(level)}
                className={`px-3 py-1 text-2xs font-medium capitalize transition-colors ${
                  breakdownLevel === level ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <DataTable
          columns={breakdownColumns}
          data={breakdown?.data || []}
          loading={bdLoading}
          emptyMessage="No campaign data for selected period"
        />
      </div>

      {/* Frequency + Pacing Row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Frequency Monitor */}
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Frequency Monitor</h3>
          {freqLoading ? (
            <div className="flex h-32 items-center justify-center"><LoadingSpinner /></div>
          ) : (
            <div className="space-y-2">
              {(frequency?.data || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded border border-zinc-700/30 bg-zinc-900/50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-zinc-300">{item.name}</p>
                    <p className="text-2xs text-zinc-500">Reach: {formatNumber(item.reach)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold tabular-nums ${item.frequency > 3 ? 'text-amber-400' : 'text-zinc-300'}`}>
                      {item.frequency.toFixed(1)}x
                    </span>
                    {item.frequency > 3 && (
                      <span className="flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-2xs font-medium text-amber-400">
                        <AlertTriangle size={10} /> High
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pacing Widget */}
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Budget Pacing</h3>
          {pacingLoading ? (
            <div className="flex h-32 items-center justify-center"><LoadingSpinner /></div>
          ) : (
            <div className="space-y-4">
              {(pacing?.data || []).map((item) => {
                const actualPct = Math.min((item.actualSpend / item.budgetCap) * 100, 100);
                const projectedPct = Math.min((item.projectedSpend / item.budgetCap) * 100, 100);
                const overPacing = item.projectedSpend > item.budgetCap;
                return (
                  <div key={item.name}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <p className="text-xs font-medium text-zinc-300">{item.name}</p>
                      <p className="text-2xs text-zinc-500">
                        Day {item.daysElapsed}/{item.totalDays}
                      </p>
                    </div>
                    <div className="relative h-5 w-full overflow-hidden rounded-full bg-zinc-900">
                      {/* Budget cap line */}
                      <div className="absolute inset-y-0 right-0 w-px bg-zinc-500" style={{ left: '100%' }} />
                      {/* Projected */}
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full ${overPacing ? 'bg-amber-500/30' : 'bg-primary-500/20'}`}
                        style={{ width: `${projectedPct}%` }}
                      />
                      {/* Actual */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary-500"
                        style={{ width: `${actualPct}%` }}
                      />
                      {/* Labels */}
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-2xs font-medium text-white drop-shadow">
                          {formatCurrency(item.actualSpend)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 flex justify-between text-2xs text-zinc-500">
                      <span>Projected: {formatCurrency(item.projectedSpend)}</span>
                      <span>Budget: {formatCurrency(item.budgetCap)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
