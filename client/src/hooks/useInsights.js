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

export function useInsights(dateParams, options = {}) {
  return useQuery({
    queryKey: ['insights', dateParams],
    queryFn: async () => {
      try {
        return await api.getInsights(dateParams);
      } catch (err) {
        if (hasAuth()) throw err;
        return getMockKPIs();
      }
    },
    staleTime: 15 * 60 * 1000,
    ...options,
  });
}

export function useTimeSeries(dateParams) {
  return useQuery({
    queryKey: ['timeseries', dateParams],
    queryFn: async () => {
      try {
        return await api.getInsights({ ...dateParams, time_increment: 1 });
      } catch (err) {
        if (hasAuth()) throw err;
        return getMockTimeSeries();
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function useCampaignBreakdown(dateParams) {
  return useQuery({
    queryKey: ['campaign-breakdown', dateParams],
    queryFn: async () => {
      try {
        return await api.getCampaigns({ ...dateParams, level: 'campaign' });
      } catch (err) {
        if (hasAuth()) throw err;
        return getMockCampaignBreakdown();
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function usePlatformSplit(dateParams) {
  return useQuery({
    queryKey: ['platform-split', dateParams],
    queryFn: async () => {
      try {
        return await api.getInsights({ ...dateParams, breakdowns: 'publisher_platform' });
      } catch (err) {
        if (hasAuth()) throw err;
        return getMockPlatformSplit();
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function usePlacementBreakdown(dateParams) {
  return useQuery({
    queryKey: ['placement-breakdown', dateParams],
    queryFn: async () => {
      try {
        return await api.getInsights({ ...dateParams, breakdowns: 'placement' });
      } catch (err) {
        if (hasAuth()) throw err;
        return getMockPlacementBreakdown();
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function useFrequencyData(dateParams) {
  return useQuery({
    queryKey: ['frequency', dateParams],
    queryFn: async () => {
      try {
        return await api.getInsights({ ...dateParams, fields: 'frequency,reach,impressions', level: 'adset' });
      } catch (err) {
        if (hasAuth()) throw err;
        return getMockFrequencyData();
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function usePacingData() {
  return useQuery({
    queryKey: ['pacing'],
    queryFn: async () => {
      try {
        return await api.getPacing();
      } catch (err) {
        if (hasAuth()) throw err;
        return getMockPacingData();
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}
