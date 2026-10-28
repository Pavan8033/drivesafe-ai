import React, { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  History,
  BarChart3,
  Sliders,
} from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { soundAlert } from '../../lib/soundAlert';

export const DashboardLayout: React.FC = () => {
  const [isSoundMuted, setIsSoundMuted] = useState(soundAlert.getIsMuted());
  const location = useLocation();

  const handleToggleSound = () => {
    const nextState = !isSoundMuted;
    soundAlert.setMuted(nextState);
    setIsSoundMuted(nextState);
  };

  // Derive route title
  const getHeaderMeta = () => {
    const path = location.pathname;
    if (path === '/app/monitor') {
      return {
        title: 'Live Monitoring Studio',
        subtitle: 'Real-time eye aspect ratio telemetry and temporal drowsiness surveillance',
      };
    }
    if (path === '/app/history') {
      return {
        title: 'Session Archives',
        subtitle: 'Chronological telemetry logs and historical event records',
      };
    }
    if (path === '/app/insights') {
      return {
        title: 'Fatigue Trend Analytics',
        subtitle: 'Mathematical distributions of driver alertness over duration',
      };
    }
    if (path === '/app/settings') {
      return {
        title: 'Instrument Preferences',
        subtitle: 'Calibration of EAR thresholds, notification chimes, and camera parameters',
      };
    }
    return {
      title: 'Vigilance Overview',
      subtitle: 'Comprehensive status of driver alertness, camera readiness, and telemetry',
    };
  };

  const meta = getHeaderMeta();

  const mobileNavItems = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/app/monitor', label: 'Monitor', icon: Video },
    { to: '/app/history', label: 'History', icon: History },
    { to: '/app/insights', label: 'Insights', icon: BarChart3 },
    { to: '/app/settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-charcoal text-ivory">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          title={meta.title}
          subtitle={meta.subtitle}
          isSoundMuted={isSoundMuted}
          onToggleSound={handleToggleSound}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-charcoal-elevated border-t border-charcoal-border flex items-center justify-around z-30 px-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-16 py-1 text-[10px] tracking-wide font-medium transition-colors ${
                    isActive ? 'text-gold' : 'text-parchment/60 hover:text-ivory'
                  }`
                }
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
