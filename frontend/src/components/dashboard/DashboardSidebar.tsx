import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  History,
  BarChart3,
  Sliders,
  ArrowLeft,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export const DashboardSidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/monitor', label: 'Monitoring', icon: Video },
    { to: '/app/history', label: 'History', icon: History },
    { to: '/app/insights', label: 'Insights', icon: BarChart3 },
    { to: '/app/settings', label: 'Settings', icon: Sliders },
  ];

  const driverName = user?.displayName || 'Alex Carter';
  const driverRole = user?.isDemoUser ? 'Demo Driver' : 'Driver';

  return (
    <aside className="w-64 border-r border-obsidian-border bg-obsidian flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-obsidian-border">
          <BrandLogo variant="dark" size="sm" to="/app" />
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-1.5">
          <span className="eyebrow text-champagne-dark text-[10px] tracking-widest px-3 block mb-2">
            TELEMETRY STUDIO
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-emerald text-ivory border border-champagne/40 shadow-sm'
                      : 'text-parchment/70 hover:text-ivory hover:bg-obsidian-elevated'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-champagne shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer: Driver Profile & Exit */}
      <div className="p-4 border-t border-obsidian-border space-y-3">
        {/* Driver Profile Card */}
        <div className="p-3 rounded bg-obsidian-elevated border border-champagne/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald text-champagne flex items-center justify-center font-serif text-sm font-semibold border border-champagne/30 shrink-0">
            {driverName.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif text-xs font-medium text-ivory truncate">
              {driverName}
            </span>
            <span className="eyebrow text-[9px] text-parchment/60 font-sans">
              {driverRole}
            </span>
          </div>
        </div>

        <NavLink
          to="/"
          className="flex items-center gap-2 text-xs text-parchment/50 hover:text-champagne transition-colors px-2 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Portal</span>
        </NavLink>
      </div>
    </aside>
  );
};
