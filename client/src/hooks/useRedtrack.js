import { useQuery } from '@tanstack/react-query';
import api, { isAuthenticated } from '../services/api.js';
import { getMockRedtrackCampaigns, getMockAlertHistory, getMockSnoozeState, getMockBotConfig, getMockRedtrackMappings } from '../mocks/redtrackData.js';

export function useRedtrackCampaigns() {
  return useQuery({
    queryKey: ['redtrack-campaigns'],
    queryFn: async () => {
      if (!isAuthenticated()) return getMockRedtrackCampaigns().data;
      const res = await api.getRedtrackCampaigns();
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRedtrackMappings() {
  return useQuery({
    queryKey: ['redtrack-mappings'],
    queryFn: async () => {
      if (!isAuthenticated()) return getMockRedtrackMappings().data;
      const res = await api.getRedtrackMappings();
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBotConfig() {
  return useQuery({
    queryKey: ['bot-config'],
    queryFn: async () => {
      if (!isAuthenticated()) return getMockBotConfig().data;
      const res = await api.getBotConfig();
      return res.data || {};
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlertHistory() {
  return useQuery({
    queryKey: ['alert-history'],
    queryFn: async () => {
      if (!isAuthenticated()) return getMockAlertHistory().data;
      const res = await api.getAlertHistory();
      return res.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSnoozeState() {
  return useQuery({
    queryKey: ['snooze-state'],
    queryFn: async () => {
      if (!isAuthenticated()) return getMockSnoozeState().data;
      const res = await api.getSnoozeState();
      return res.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useTelegramStatus() {
  return useQuery({
    queryKey: ['telegram-status'],
    queryFn: async () => {
      if (!isAuthenticated()) return { connected: false };
      const res = await api.getTelegramStatus();
      return res.data || { connected: false };
    },
    staleTime: 30 * 1000,
  });
}
