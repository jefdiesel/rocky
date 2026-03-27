import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, User, ChevronDown, LogOut, RefreshCw, Menu } from 'lucide-react';
import clsx from 'clsx';
import DateRangePicker from '../common/DateRangePicker.jsx';
import api from '../../services/api.js';

export default function TopBar({ accounts, selectedAccount, onSelectAccount, dateRange, onMenuToggle, platform, onTogglePlatform }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [accountOpen, setAccountOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const accountRef = useRef(null);
  const userRef = useRef(null);

  // Fetch real user info
  const { data: user } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const res = await api.getMe();
        return res.data || res;
      } catch {
        return null;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const handleRefreshData = () => {
    queryClient.invalidateQueries();
    setUserOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch {
      // server may be unavailable, proceed anyway
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('meta_token');
    localStorage.removeItem('selected_account_id');
    setUserOpen(false);
    navigate('/settings');
  };

  useEffect(() => {
    function handleClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isTikTok = platform === 'tiktok';

  return (
    <header className="flex h-12 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-2 md:px-4">
      {/* Left: Hamburger + Platform Toggle + Account Switcher */}
      <div className="flex items-center gap-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors flex-shrink-0"
        >
          <Menu size={18} />
        </button>

        {/* Platform toggle */}
        <button
          onClick={onTogglePlatform}
          className={clsx(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors flex-shrink-0',
            isTikTok
              ? 'bg-pink-500/15 text-pink-400 hover:bg-pink-500/25'
              : 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
          )}
        >
          {isTikTok ? 'TT' : 'f'}
        </button>

      <div className="relative min-w-0" ref={accountRef}>
        <button
          onClick={() => setAccountOpen(!accountOpen)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary-600 text-2xs font-bold text-white">
            {(selectedAccount?.name || selectedAccount?.advertiser_name || 'R').charAt(0)}
          </div>
          <span className="max-w-[100px] md:max-w-[200px] truncate font-medium">
            {selectedAccount?.name || selectedAccount?.advertiser_name || 'Select account'}
          </span>
          <ChevronDown size={13} className={clsx('text-zinc-500 transition-transform', accountOpen && 'rotate-180')} />
        </button>
        {accountOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-xl">
            {accounts.map((acc) => {
              const accId = acc.account_id || acc.advertiser_id || acc.id;
              const accName = acc.name || acc.advertiser_name;
              return (
                <button
                  key={accId}
                  onClick={() => { onSelectAccount(accId); setAccountOpen(false); }}
                  className={clsx(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors',
                    accId === (selectedAccount?.id || selectedAccount?.account_id || selectedAccount?.advertiser_id)
                      ? 'bg-primary-600/15 text-primary-400'
                      : 'text-zinc-300 hover:bg-zinc-700'
                  )}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-700 text-2xs font-bold text-zinc-300">
                    {accName?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{accName}</p>
                    <p className="text-2xs text-zinc-500">{accId} &middot; {acc.currency || 'USD'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Right: Date picker, notifications, user */}
      <div className="flex items-center gap-2">
        <DateRangePicker
          preset={dateRange.preset}
          dates={dateRange.dates}
          onPresetChange={dateRange.selectPreset}
          onCustomRange={dateRange.setCustomRange}
          customStart={dateRange.customStart}
          customEnd={dateRange.customEnd}
        />

        <button className="relative rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
          <Bell size={15} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500" />
        </button>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700">
              <User size={13} />
            </div>
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-xl">
              <div className="border-b border-zinc-700 px-3 py-2">
                <p className="text-xs font-medium text-zinc-200">{user?.name || 'Ad Manager'}</p>
                <p className="text-2xs text-zinc-500">{user?.email || 'Not signed in'}</p>
              </div>
              <button
                onClick={handleRefreshData}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                <RefreshCw size={13} /> Refresh Data
              </button>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-zinc-700 hover:text-red-300"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
