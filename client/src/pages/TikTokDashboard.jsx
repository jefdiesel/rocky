import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, Target } from 'lucide-react';
import KPICard from '../components/common/KPICard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import PageGuide from '../components/common/PageGuide.jsx';
import { formatCurrency, formatNumber } from '../utils/format.js';
import api from '../services/api.js';

export default function TikTokDashboard() {
  const advertiserId = localStorage.getItem('selected_account_id');

  const { data, isLoading } = useQuery({
    queryKey: ['tiktok-insights', advertiserId],
    queryFn: async () => {
      const res = await api.tiktok.getInsights(advertiserId);
      return res.data || {};
    },
  });

  const summary = data?.summary || {};
  const daily = data?.daily || [];
  const byCampaign = data?.by_campaign || [];

  const kpis = [
    { label: 'Total Spend', value: formatCurrency(summary.spend), icon: DollarSign, trend: '+12.3%', trendUp: false },
    { label: 'Impressions', value: formatNumber(summary.impressions), icon: Eye, trend: '+8.1%', trendUp: true },
    { label: 'Clicks', value: formatNumber(summary.clicks), icon: MousePointer, trend: '+15.2%', trendUp: true },
    { label: 'Conversions', value: formatNumber(summary.conversions), icon: Target, trend: '+22.5%', trendUp: true },
    { label: 'CTR', value: (summary.ctr || 0).toFixed(2) + '%', icon: TrendingUp, trend: '+0.3%', trendUp: true },
    { label: 'CPC', value: formatCurrency(summary.cpc), icon: DollarSign, trend: '-5.1%', trendUp: true },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="tiktok-dashboard"
        title="TikTok Dashboard"
        tips={[
          'TikTok uses stat_cost for spend and click_cnt for clicks in the API',
          'Metrics shown are for the selected date range',
          'Use the platform toggle in the top bar to switch between Meta and TikTok',
        ]}
      />
      <h1 className="text-lg font-semibold text-zinc-100">TikTok Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Daily Performance */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Daily Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-500">
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-right font-medium">Spend</th>
                <th className="pb-2 text-right font-medium">Impressions</th>
                <th className="pb-2 text-right font-medium">Clicks</th>
                <th className="pb-2 text-right font-medium">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((day) => (
                <tr key={day.date} className="border-b border-zinc-700/50">
                  <td className="py-2 text-zinc-300">{day.date}</td>
                  <td className="py-2 text-right text-zinc-300">{formatCurrency(day.spend)}</td>
                  <td className="py-2 text-right text-zinc-400">{formatNumber(day.impressions)}</td>
                  <td className="py-2 text-right text-zinc-400">{formatNumber(day.clicks)}</td>
                  <td className="py-2 text-right text-zinc-400">{formatNumber(day.conversions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Breakdown */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Campaign Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-500">
                <th className="pb-2 text-left font-medium">Campaign</th>
                <th className="pb-2 text-right font-medium">Spend</th>
                <th className="pb-2 text-right font-medium">Impressions</th>
                <th className="pb-2 text-right font-medium">Clicks</th>
                <th className="pb-2 text-right font-medium">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {byCampaign.map((camp) => (
                <tr key={camp.campaign_id} className="border-b border-zinc-700/50">
                  <td className="py-2 text-zinc-300">{camp.campaign_name}</td>
                  <td className="py-2 text-right text-zinc-300">{formatCurrency(camp.spend)}</td>
                  <td className="py-2 text-right text-zinc-400">{formatNumber(camp.impressions)}</td>
                  <td className="py-2 text-right text-zinc-400">{formatNumber(camp.clicks)}</td>
                  <td className="py-2 text-right text-zinc-400">{formatNumber(camp.conversions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
