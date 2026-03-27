import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Palette,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

const META_NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/audiences', icon: Users, label: 'Audiences' },
  { to: '/creative', icon: Palette, label: 'Creative' },
  { to: '/studio', icon: Sparkles, label: 'Creative Studio' },
  { to: '/pixels', icon: Activity, label: 'Pixels' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const TIKTOK_NAV = [
  { to: '/tiktok/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tiktok/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/tiktok/audiences', icon: Users, label: 'Audiences' },
  { to: '/tiktok/creative', icon: Palette, label: 'Creative' },
  { to: '/studio', icon: Sparkles, label: 'Creative Studio' },
  { to: '/tiktok/pixels', icon: Activity, label: 'Pixels' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ selectedAccount, sidebarOpen, setSidebarOpen, platform }) {
  const [collapsed, setCollapsed] = useState(false);
  const isTikTok = platform === 'tiktok';
  const navItems = isTikTok ? TIKTOK_NAV : META_NAV;

  const sidebarContent = (
    <>
      {/* Brand + collapse toggle */}
      <div className="flex h-12 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="flex-shrink-0 text-primary-500" />
          {!collapsed && <span className="text-sm font-bold tracking-tight text-zinc-100">Remi</span>}
        </div>
        {/* Mobile close */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          <X size={18} />
        </button>
        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Platform indicator */}
      {!collapsed && (
        <div className={clsx(
          'mx-2 mt-2 rounded-md px-2.5 py-1.5 text-center text-2xs font-semibold uppercase tracking-wider',
          isTikTok ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'
        )}>
          {isTikTok ? 'TikTok Ads' : 'Meta Ads'}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/tiktok/dashboard'}
            onClick={() => setSidebarOpen(false)}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              clsx(
                'mx-2 mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary-600/15 text-primary-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                collapsed && 'justify-center'
              )
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Account info */}
      {selectedAccount && !collapsed && (
        <div className="border-t border-zinc-800 px-3 py-3">
          <p className="truncate text-2xs font-medium text-zinc-400">{selectedAccount.name || selectedAccount.advertiser_name}</p>
          <p className="truncate text-2xs text-zinc-600">{selectedAccount.id || selectedAccount.advertiser_id}</p>
        </div>
      )}

    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'sidebar-transition hidden md:flex flex-col border-r border-zinc-800 bg-zinc-900',
          collapsed ? 'w-16' : 'w-52'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 transition-transform duration-300 ease-in-out md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
