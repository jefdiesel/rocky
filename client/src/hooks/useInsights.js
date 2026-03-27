import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import api, { isAuthenticated } from '../services/api.js';
import {
  getMockKPIs,
  getMockTimeSeries,
  getMockCampaignBreakdown,
  getMockPlatformSplit,
  getMockPlacementBreakdown,
  getMockFrequencyData,
  getMockPacingData,
} from '../mocks/dashboardData.js';

function safeFetch(fn, mockFn) {
  return async () => {
    if (!isAuthenticated()) return mockFn();
    return fn();
  };
}

// Meta API returns all metric values as strings. Parse them to numbers.
function num(v) {
  if (v == null) return 0;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? 0 : n;
}

// Extract conversions (purchase actions) and purchase ROAS from Meta's nested structures
function extractActions(row) {
  let conversions = 0;
  let cpa = 0;
  let roas = 0;
  if (Array.isArray(row.actions)) {
    const purchase = row.actions.find((a) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase');
    if (purchase) conversions = num(purchase.value);
  }
  if (Array.isArray(row.cost_per_action_type)) {
    const purchaseCpa = row.cost_per_action_type.find((a) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase');
    if (purchaseCpa) cpa = num(purchaseCpa.value);
  }
  if (Array.isArray(row.purchase_roas)) {
    const roasEntry = row.purchase_roas.find((a) => a.action_type === 'omni_purchase' || a.action_type === 'purchase');
    if (roasEntry) roas = num(roasEntry.value);
  }
  // Fallback: if roas/cpa are top-level numbers (from cache or already processed)
  if (!roas && row.roas != null) roas = num(row.roas);
  if (!cpa && row.cpa != null) cpa = num(row.cpa);
  if (!conversions && row.conversions != null) conversions = num(row.conversions);
  return { conversions, cpa, roas };
}

// Transform raw Meta insights array into aggregated KPI object
function transformKPIs(response) {
  if (response?._mock) return response;
  const rows = response?.data || response || [];
  if (!Array.isArray(rows) || rows.length === 0) return response;

  // Aggregate across all rows
  let spend = 0, impressions = 0, clicks = 0, reach = 0, conversions = 0, revenue = 0;
  for (const row of rows) {
    spend += num(row.spend);
    impressions += num(row.impressions);
    clicks += num(row.clicks);
    reach += num(row.reach);
    const acts = extractActions(row);
    conversions += acts.conversions;
  }

  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpa = conversions > 0 ? spend / conversions : 0;
  // Use first row's ROAS if available, else compute
  const firstActs = rows.length > 0 ? extractActions(rows[0]) : {};
  const roas = firstActs.roas || (spend > 0 && revenue > 0 ? revenue / spend : 0);

  return {
    spend, impressions, reach, clicks, conversions,
    cpm: Math.round(cpm * 100) / 100,
    ctr: Math.round(ctr * 100) / 100,
    cpc: Math.round(cpc * 100) / 100,
    cpa: Math.round(cpa * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    // Trends are not available from Meta API directly; default to null
    spendTrend: null, impressionsTrend: null, reachTrend: null,
    cpmTrend: null, ctrTrend: null, cpcTrend: null,
    conversionsTrend: null, cpaTrend: null, roasTrend: null,
  };
}

// Transform daily time-increment insights into chart-ready array
function transformTimeSeries(response) {
  if (response?._mock) return response;
  const rows = response?.data || response || [];
  if (!Array.isArray(rows) || rows.length === 0) return { data: [] };

  const data = rows.map((row) => {
    const acts = extractActions(row);
    const dateStr = row.date_start || row.date || '';
    let dateLabel = dateStr;
    try {
      if (dateStr) dateLabel = format(new Date(dateStr), 'MMM d');
    } catch { /* keep raw */ }
    return {
      date: dateStr,
      dateLabel,
      spend: num(row.spend),
      impressions: num(row.impressions),
      reach: num(row.reach),
      clicks: num(row.clicks),
      conversions: acts.conversions,
    };
  });

  return { data };
}

// Transform campaign-level response into breakdown table rows
function transformCampaignBreakdown(response) {
  if (response?._mock) return response;
  const rows = response?.data || response || [];
  if (!Array.isArray(rows) || rows.length === 0) return { data: [] };

  const data = rows.map((row) => {
    const spend = num(row.spend);
    const impressions = num(row.impressions);
    const clicks = num(row.clicks);
    const acts = extractActions(row);
    return {
      id: row.campaign_id || row.id,
      name: row.campaign_name || row.name || 'Unknown',
      objective: row.objective || '',
      status: row.status || row.effective_status || '',
      spend,
      impressions,
      clicks,
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
      cpm: impressions > 0 ? Math.round((spend / impressions) * 100000) / 100 : 0,
      conversions: acts.conversions,
      cpa: acts.cpa || (acts.conversions > 0 ? Math.round((spend / acts.conversions) * 100) / 100 : 0),
      roas: acts.roas,
    };
  });

  return { data };
}

// Transform platform breakdown into pie chart data
const PLATFORM_COLORS = {
  facebook: '#1877F2', instagram: '#E4405F', audience_network: '#FF6D00',
  messenger: '#0084FF', unknown: '#71717a',
};

function transformPlatformSplit(response) {
  if (response?._mock) return response;
  const rows = response?.data || response || [];
  if (!Array.isArray(rows) || rows.length === 0) return { data: [] };

  const data = rows.map((row) => {
    const platform = (row.publisher_platform || 'unknown').toLowerCase();
    return {
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      value: num(row.spend),
      fill: PLATFORM_COLORS[platform] || PLATFORM_COLORS.unknown,
    };
  });

  return { data };
}

// Transform placement breakdown into bar chart data
function transformPlacementBreakdown(response) {
  if (response?._mock) return response;
  const rows = response?.data || response || [];
  if (!Array.isArray(rows) || rows.length === 0) return { data: [] };

  const data = rows.map((row) => ({
    placement: row.placement || row.publisher_platform || 'Unknown',
    spend: num(row.spend),
    impressions: num(row.impressions),
    clicks: num(row.clicks),
  }));

  return { data };
}

// Transform frequency data
function transformFrequencyData(response) {
  if (response?._mock) return response;
  const rows = response?.data || response || [];
  if (!Array.isArray(rows) || rows.length === 0) return { data: [] };

  const data = rows.map((row) => ({
    id: row.adset_id || row.id || Math.random().toString(36).slice(2),
    name: row.adset_name || row.name || 'Unknown',
    frequency: num(row.frequency),
    reach: num(row.reach),
    impressions: num(row.impressions),
  }));

  return { data };
}

// Transform pacing data (server already computes most values)
function transformPacingData(response) {
  if (response?._mock) return response;
  const rows = response?.data || response || [];
  if (!Array.isArray(rows) || rows.length === 0) return { data: [] };

  const data = rows.map((row) => ({
    name: row.campaign_name || row.name || 'Unknown',
    actualSpend: num(row.total_spend || row.actualSpend),
    projectedSpend: num(row.projected_spend || row.projectedSpend),
    budgetCap: num(row.target_budget || row.budgetCap || row.lifetime_budget || row.daily_budget),
    daysElapsed: num(row.days_elapsed || row.daysElapsed),
    totalDays: num(row.total_days || row.totalDays),
    pace: row.pace || 'on_track',
  }));

  return { data };
}

export function useInsights(dateParams, options = {}) {
  return useQuery({
    queryKey: ['insights', dateParams],
    queryFn: safeFetch(
      async () => transformKPIs(await api.getInsights(dateParams)),
      getMockKPIs
    ),
    staleTime: 15 * 60 * 1000,
    ...options,
  });
}

export function useTimeSeries(dateParams) {
  return useQuery({
    queryKey: ['timeseries', dateParams],
    queryFn: safeFetch(
      async () => transformTimeSeries(await api.getInsights({ ...dateParams, time_increment: 1 })),
      getMockTimeSeries
    ),
    staleTime: 15 * 60 * 1000,
  });
}

export function useCampaignBreakdown(dateParams) {
  return useQuery({
    queryKey: ['campaign-breakdown', dateParams],
    queryFn: safeFetch(
      async () => transformCampaignBreakdown(await api.getCampaigns({ ...dateParams, level: 'campaign' })),
      getMockCampaignBreakdown
    ),
    staleTime: 15 * 60 * 1000,
  });
}

export function usePlatformSplit(dateParams) {
  return useQuery({
    queryKey: ['platform-split', dateParams],
    queryFn: safeFetch(
      async () => transformPlatformSplit(await api.getInsights({ ...dateParams, breakdowns: 'publisher_platform' })),
      getMockPlatformSplit
    ),
    staleTime: 15 * 60 * 1000,
  });
}

export function usePlacementBreakdown(dateParams) {
  return useQuery({
    queryKey: ['placement-breakdown', dateParams],
    queryFn: safeFetch(
      async () => transformPlacementBreakdown(await api.getInsights({ ...dateParams, breakdowns: 'placement' })),
      getMockPlacementBreakdown
    ),
    staleTime: 15 * 60 * 1000,
  });
}

export function useFrequencyData(dateParams) {
  return useQuery({
    queryKey: ['frequency', dateParams],
    queryFn: safeFetch(
      async () => transformFrequencyData(await api.getInsights({ ...dateParams, fields: 'frequency,reach,impressions', level: 'adset' })),
      getMockFrequencyData
    ),
    staleTime: 15 * 60 * 1000,
  });
}

export function usePacingData() {
  return useQuery({
    queryKey: ['pacing'],
    queryFn: safeFetch(
      async () => transformPacingData(await api.getPacing()),
      getMockPacingData
    ),
    staleTime: 15 * 60 * 1000,
  });
}
