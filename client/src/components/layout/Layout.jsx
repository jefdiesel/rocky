import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import useAccounts from '../../hooks/useAccounts.js';
import useDateRange from '../../hooks/useDateRange.js';

export default function Layout() {
  const { accounts, selectedAccount, selectAccount } = useAccounts();
  const dateRange = useDateRange('last_7d');

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Sidebar selectedAccount={selectedAccount} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          accounts={accounts}
          selectedAccount={selectedAccount}
          onSelectAccount={selectAccount}
          dateRange={dateRange}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet context={{ dateRange, selectedAccount }} />
        </main>
      </div>
    </div>
  );
}
