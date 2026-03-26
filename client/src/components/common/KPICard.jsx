import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function KPICard({ label, value, trend, sparklineData, loading = false }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/80 p-3">
        <div className="mb-2 h-3 w-20 animate-pulse rounded bg-zinc-700" />
        <div className="mb-1 h-6 w-24 animate-pulse rounded bg-zinc-700" />
        <div className="h-3 w-16 animate-pulse rounded bg-zinc-700" />
      </div>
    );
  }

  const trendPositive = trend > 0;
  const trendNeutral = trend === 0 || trend == null;

  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/80 p-3 hover:border-zinc-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100 tabular-nums">{value}</p>
          {!trendNeutral && (
            <div className={clsx('mt-1 flex items-center gap-1 text-2xs font-medium', trendPositive ? 'text-emerald-400' : 'text-red-400')}>
              {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trendPositive ? '+' : ''}{trend?.toFixed(1)}%</span>
            </div>
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="sparkline-container flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={trendPositive ? '#34d399' : '#f87171'}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
