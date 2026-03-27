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

  // Always use the id field (has act_ prefix) which the Meta API requires
  const getActId = (acc) => {
    if (acc.id && acc.id.startsWith('act_')) return acc.id;
    if (acc.account_id && acc.account_id.startsWith('act_')) return acc.account_id;
    return acc.id ? `act_${acc.id}` : `act_${acc.account_id}`;
  };

  useEffect(() => {
    if (accounts.length > 0) {
      // Fix stored ID if it's missing the act_ prefix
      const fixedId = selectedAccountId && !selectedAccountId.startsWith('act_')
        ? `act_${selectedAccountId}` : selectedAccountId;
      const match = accounts.find((a) => getActId(a) === fixedId);
      if (!match) {
        const firstId = getActId(accounts[0]);
        setSelectedAccountId(firstId);
        localStorage.setItem('selected_account_id', firstId);
      } else if (fixedId !== selectedAccountId) {
        setSelectedAccountId(fixedId);
        localStorage.setItem('selected_account_id', fixedId);
      }
    }
  }, [accounts, selectedAccountId]);

  const selectAccount = useCallback((id) => {
    const actId = id && !id.startsWith('act_') ? `act_${id}` : id;
    setSelectedAccountId(actId);
    localStorage.setItem('selected_account_id', actId);
  }, []);

  const selectedAccount = accounts.find((a) => getActId(a) === selectedAccountId) || accounts[0] || null;

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
