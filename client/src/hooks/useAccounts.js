import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import api from '../services/api.js';
import { getMockAccounts } from '../mocks/dashboardData.js';

export function useAccounts() {
  const [selectedAccountId, setSelectedAccountId] = useState(
    () => localStorage.getItem('selected_account_id') || null
  );

  const platform = localStorage.getItem('rocky_platform') || 'meta';
  const isTikTok = platform === 'tiktok';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accounts', platform],
    queryFn: async () => {
      try {
        if (isTikTok) {
          const res = await api.tiktok.getAccounts();
          return res.data || res;
        }
        const res = await api.getAccounts();
        return res.data || res;
      } catch (err) {
        if (localStorage.getItem('auth_token')) throw err;
        const mock = getMockAccounts();
        return mock.data;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const accounts = data || [];

  // Get the canonical ID for an account
  const getAccountId = (acc) => {
    if (isTikTok) {
      return acc.advertiser_id || acc.id;
    }
    // Meta: ensure act_ prefix
    if (acc.id && acc.id.startsWith('act_')) return acc.id;
    if (acc.account_id && acc.account_id.startsWith('act_')) return acc.account_id;
    return acc.id ? `act_${acc.id}` : `act_${acc.account_id}`;
  };

  useEffect(() => {
    if (accounts.length > 0) {
      if (isTikTok) {
        // For TikTok, don't apply act_ prefix logic
        const match = accounts.find((a) => (a.advertiser_id || a.id) === selectedAccountId);
        if (!match) {
          const firstId = getAccountId(accounts[0]);
          setSelectedAccountId(firstId);
          localStorage.setItem('selected_account_id', firstId);
        }
      } else {
        // Meta: fix stored ID if it's missing the act_ prefix
        const fixedId = selectedAccountId && !selectedAccountId.startsWith('act_')
          ? `act_${selectedAccountId}` : selectedAccountId;
        const match = accounts.find((a) => getAccountId(a) === fixedId);
        if (!match) {
          const firstId = getAccountId(accounts[0]);
          setSelectedAccountId(firstId);
          localStorage.setItem('selected_account_id', firstId);
        } else if (fixedId !== selectedAccountId) {
          setSelectedAccountId(fixedId);
          localStorage.setItem('selected_account_id', fixedId);
        }
      }
    }
  }, [accounts, selectedAccountId, isTikTok]);

  const selectAccount = useCallback((id) => {
    let finalId = id;
    if (!isTikTok) {
      finalId = id && !id.startsWith('act_') ? `act_${id}` : id;
    }
    setSelectedAccountId(finalId);
    localStorage.setItem('selected_account_id', finalId);
  }, [isTikTok]);

  const selectedAccount = accounts.find((a) => getAccountId(a) === selectedAccountId) || accounts[0] || null;

  return {
    accounts,
    selectedAccount,
    selectedAccountId,
    selectAccount,
    isLoading,
    error,
    refetch,
  };
}

export default useAccounts;
