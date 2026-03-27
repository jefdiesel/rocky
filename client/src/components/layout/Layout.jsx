import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import WelcomeModal from '../common/WelcomeModal.jsx';
import useAccounts from '../../hooks/useAccounts.js';
import useDateRange from '../../hooks/useDateRange.js';
import usePlatform from '../../hooks/usePlatform.js';

export default function Layout() {
  const { accounts, selectedAccount, selectAccount } = useAccounts();
  const dateRange = useDateRange('last_7d');
  const { platform, togglePlatform } = usePlatform();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleTogglePlatform = () => {
    togglePlatform();
    // Navigate to the equivalent page on the other platform
    if (platform === 'meta') {
      navigate('/tiktok/campaigns');
    } else {
      navigate('/campaigns');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <WelcomeModal />
      <Sidebar
        selectedAccount={selectedAccount}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        platform={platform}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          accounts={accounts}
          selectedAccount={selectedAccount}
          onSelectAccount={selectAccount}
          dateRange={dateRange}
          onMenuToggle={() => setSidebarOpen(true)}
          platform={platform}
          onTogglePlatform={handleTogglePlatform}
        />
        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          <Outlet context={{ dateRange, selectedAccount, platform }} />
        </main>
      </div>
    </div>
  );
}
