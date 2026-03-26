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
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/audiences', icon: Users, label: 'Audiences' },
  { to: '/creative', icon: Palette, label: 'Creative' },
  { to: '/pixels', icon: Activity, label: 'Pixels' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ selectedAccount }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'sidebar-transition flex flex-col border-r border-zinc-800 bg-zinc-900',
        collapsed ? 'w-16' : 'w-52'
      )}
    >
      {/* Brand */}
      <div className="flex h-12 items-center gap-2 border-b border-zinc-800 px-4">
        <Zap size={20} className="flex-shrink-0 text-primary-500" />
        {!collapsed && <span className="text-sm font-bold tracking-tight text-zinc-100">Rocky Ads</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'mx-2 mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary-600/15 text-primary-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
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
          <p className="truncate text-2xs font-medium text-zinc-400">{selectedAccount.name}</p>
          <p className="truncate text-2xs text-zinc-600">{selectedAccount.id}</p>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center border-t border-zinc-800 py-2.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
