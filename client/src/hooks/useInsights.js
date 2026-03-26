import { useQuery } from '@tanstack/react-query';
import api from '../services/api.js';
import {
  getMockKPIs,
  getMockTimeSeries,
  getMockCampaignBreakdown,
  getMockPlatformSplit,
  getMockPlacementBreakdown,
  getMockFrequencyData,
  getMockPacingData,
} from '../mocks/dashboardData.js';

const hasAuth = () => !!localStorage.getItem('auth_token');

function safeFetch(fn, mockFn) {
  return async () => {
    try {
      return await fn();
    } catch (err) {
      if (!hasAuth()) return mockFn();
      if (err.status === 401) throw err;
      console.warn('[insights]', err.message);
      return { data: [] };
    }
  };
}

export function useInsights(dateParams, options = {}) {
  return useQuery({
    queryKey: ['insights', dateParams],
    queryFn: safeFetch(() => api.getInsights(dateParams), getMockKPIs),
    staleTime: 15 * 60 * 1000,
    ...options,
  });
}

export function useTimeSeries(dateParams) {
  return useQuery({
    queryKey: ['timeseries', dateParams],
    queryFn: safeFetch(() => api.getInsights({ ...dateParams, time_increment: 1 }), getMockTimeSeries),
    staleTime: 15 * 60 * 1000,
  });
}

export function useCampaignBreakdown(dateParams) {
  return useQuery({
    queryKey: ['campaign-breakdown', dateParams],
    queryFn: safeFetch(() => api.getCampaigns({ ...dateParams, level: 'campaign' }), getMockCampaignBreakdown),
    staleTime: 15 * 60 * 1000,
  });
}

export function usePlatformSplit(dateParams) {
  return useQuery({
    queryKey: ['platform-split', dateParams],
    queryFn: safeFetch(() => api.getInsights({ ...dateParams, breakdowns: 'publisher_platform' }), getMockPlatformSplit),
    staleTime: 15 * 60 * 1000,
  });
}

export function usePlacementBreakdown(dateParams) {
  return useQuery({
    queryKey: ['placement-breakdown', dateParams],
    queryFn: safeFetch(() => api.getInsights({ ...dateParams, breakdowns: 'placement' }), getMockPlacementBreakdown),
    staleTime: 15 * 60 * 1000,
  });
}

export function useFrequencyData(dateParams) {
  return useQuery({
    queryKey: ['frequency', dateParams],
    queryFn: safeFetch(() => api.getInsights({ ...dateParams, fields: 'frequency,reach,impressions', level: 'adset' }), getMockFrequencyData),
    staleTime: 15 * 60 * 1000,
  });
}

export function usePacingData() {
  return useQuery({
    queryKey: ['pacing'],
    queryFn: safeFetch(() => api.getPacing(), getMockPacingData),
    staleTime: 15 * 60 * 1000,
  });
}
