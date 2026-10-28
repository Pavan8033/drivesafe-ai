import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  History,
  BarChart3,
  Sliders,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const DashboardSidebar: React.FC = () => {
  const navItems = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/app/monitor', label: 'Live Monitoring', icon: Video },
    { to: '/app/history', label: 'Session Archive', icon: History },
    { to: '/app/insights', label: 'Fatigue Insights', icon: BarChart3 },
    { to: '/app/settings', label: 'Telemetry Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-charcoal-border bg-charcoal flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-charcoal-border">
          <BrandLogo variant="dark" size="sm" to="/app" />
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-1.5">
          <span className="eyebrow text-gold-muted text-[10px] tracking-widest px-3 block mb-2">
            Motoring Studio
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
                      ? 'bg-forest text-ivory border border-gold/40 shadow-sm'
                      : 'text-parchment/70 hover:text-ivory hover:bg-charcoal-elevated'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-gold shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-charcoal-border space-y-3">
        <div className="p-3 rounded bg-charcoal-elevated border border-gold/15 text-[11px] text-parchment/60 font-sans">
          <div className="flex items-center gap-1.5 text-gold font-medium mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Telemetry v1.0.0</span>
          </div>
          <p className="leading-tight">
            Local computer-vision engine processing at 10 FPS.
          </p>
        </div>

        <NavLink
          to="/"
          className="flex items-center gap-2 text-xs text-parchment/50 hover:text-gold transition-colors px-2 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Portal</span>
        </NavLink>
      </div>
    </aside>
  );
};
