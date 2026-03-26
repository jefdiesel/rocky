import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import api from '../services/api.js';
import { getMockAccounts } from '../mocks/dashboardData.js';

export function useAccounts() {
  const [selectedAccountId, setSelectedAccountId] = useState(
    () => localStorage.getItem('selected_account_id') || null
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      try {
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

  useEffect(() => {
    if (accounts.length > 0) {
      const match = accounts.find((a) => (a.account_id || a.id) === selectedAccountId);
      if (!match) {
        const firstId = accounts[0].account_id || accounts[0].id;
        setSelectedAccountId(firstId);
        localStorage.setItem('selected_account_id', firstId);
      }
    }
  }, [accounts, selectedAccountId]);

  const selectAccount = useCallback((id) => {
    setSelectedAccountId(id);
    localStorage.setItem('selected_account_id', id);
  }, []);

  const selectedAccount = accounts.find((a) => (a.account_id || a.id) === selectedAccountId) || accounts[0] || null;

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
