import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Clock,
  AlertTriangle,
  Activity,
  History,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/dashboard/MetricCard';
import { getUserSessions } from '../lib/sessionStorage';
import type { SessionSummary } from '../types/session';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [timeRange, setTimeRange] = useState<string>('Last 7 Days');
  const [engineHealth, setEngineHealth] = useState<{
    status: string;
    modelLoaded: boolean;
    version: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    // 1. Fetch user sessions
    if (user?.uid) {
      getUserSessions(user.uid).then((data) => {
        if (isMounted) setSessions(data);
      });
    }

    // 2. Fetch FastAPI backend health
    fetch(`${API_BASE}/api/health`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && isMounted) {
          setEngineHealth({
            status: data.status,
            modelLoaded: data.model_loaded,
            version: data.version,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setEngineHealth({
            status: 'STANDBY',
            modelLoaded: false,
            version: '1.0.0',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Real calculations derived from actual recorded sessions
  const actualSessionsCount = sessions.length;
  const actualDrowsiness = sessions.reduce(
    (acc, s) => acc + (s.drowsiness_event_count || 0),
    0
  );
  const actualYawns = sessions.reduce(
    (acc, s) => acc + (s.possible_yawning_event_count || 0),
    0
  );
  const actualDurationSeconds = sessions.reduce(
    (acc, s) => acc + (s.duration_seconds || 0),
    0
  );

  const formatTotalTime = (totalSeconds: number) => {
    const rounded = Math.round(totalSeconds);
    if (rounded <= 0) return '0m 00s';
    const hrs = Math.floor(rounded / 3600);
    const mins = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatApproxTime = (totalSeconds: number) => {
    const rounded = Math.round(totalSeconds);
    if (rounded <= 0) return '0 min';
    if (rounded < 60) return `~${rounded}s`;
    const mins = Math.round(rounded / 60);
    if (mins >= 60) {
      const hrs = (rounded / 3600).toFixed(1);
      return `~${hrs} hrs`;
    }
    return `~${mins} min`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-obsidian-border">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ivory">
            Dashboard
          </h1>
          <div className="flex items-center gap-2.5 mt-0.5">
            <span className="text-xs text-parchment/60 font-sans">
              Your driving vigilance at a glance.
            </span>
            {engineHealth && (
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  engineHealth.status === 'HEALTHY' || engineHealth.modelLoaded
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                    : 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    engineHealth.status === 'HEALTHY' || engineHealth.modelLoaded
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span>
                  Vision Engine{' '}
                  {engineHealth.status === 'HEALTHY' || engineHealth.modelLoaded
                    ? 'Online'
                    : 'Standby'}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Time Filter Dropdown */}
        <div className="relative inline-block text-left">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none bg-obsidian-elevated border border-champagne/30 rounded px-4 py-2 pr-9 text-xs font-sans text-ivory focus:outline-none focus:border-champagne cursor-pointer"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="All Time">All Time</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-champagne absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 4 Metric Cards Matching Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          label="Total Sessions"
          value={actualSessionsCount}
          trend={actualSessionsCount > 0 ? `${actualSessionsCount} total` : 'No sessions yet'}
          trendPositive={true}
          showBars={actualSessionsCount > 0}
          subtext="Recorded in driver session archives"
          icon={<History className="w-4 h-4" />}
          status="neutral"
        />

        <MetricCard
          label="Total Drive Time"
          value={formatTotalTime(actualDurationSeconds)}
          trend={formatApproxTime(actualDurationSeconds)}
          trendPositive={true}
          showBars={actualDurationSeconds > 0}
          subtext="Total active observation elapsed"
          icon={<Clock className="w-4 h-4" />}
          status="neutral"
        />

        <MetricCard
          label="Drowsiness Events"
          value={actualDrowsiness}
          trend={actualDrowsiness > 0 ? `${actualDrowsiness} incidents` : '0 incidents'}
          trendPositive={actualDrowsiness === 0}
          showBars={actualDrowsiness > 0}
          subtext="Closures sustained ≥ 1.5s"
          icon={<AlertTriangle className="w-4 h-4" />}
          status={actualDrowsiness > 0 ? 'warning' : 'safe'}
        />

        <MetricCard
          label="Yawns Detected"
          value={actualYawns}
          trend={actualYawns > 0 ? `${actualYawns} events` : '0 events'}
          trendPositive={true}
          showBars={actualYawns > 0}
          subtext="Elevated MAR respiratory events"
          icon={<Activity className="w-4 h-4" />}
          status="neutral"
        />
      </div>

      {/* Main Grid: Vigilance Trend + System Health + Right Automotive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Col 8): Vigilance Trend & System Health */}
        <div className="lg:col-span-8 space-y-6">
          {/* Vigilance Trend Bar Chart */}
          <div className="p-6 rounded bg-obsidian-card border border-champagne/25 shadow-luxury-dark">
            <div className="flex items-center justify-between pb-4 border-b border-obsidian-border mb-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-ivory">
                  Vigilance Trend
                </h3>
                <p className="text-xs text-parchment/60 font-sans mt-0.5">
                  Interval distribution of palpebral aperture stability
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-xs" />
                  <span>EAR</span>
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 bg-cyan-400 rounded-xs" />
                  <span>MAR</span>
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 bg-red-400 rounded-xs" />
                  <span>Alerts</span>
                </span>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-obsidian-border">
              {[
                { time: '00', earH: 65, marH: 40, alertH: 15 },
                { time: '02', earH: 80, marH: 30, alertH: 0 },
                { time: '04', earH: 45, marH: 60, alertH: 25 },
                { time: '06', earH: 90, marH: 25, alertH: 0 },
                { time: '08', earH: 85, marH: 35, alertH: 10 },
                { time: '10', earH: 70, marH: 45, alertH: 0 },
                { time: '12', earH: 95, marH: 20, alertH: 0 },
                { time: '14', earH: 60, marH: 50, alertH: 20 },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* EAR Bar */}
                    <div
                      style={{ height: `${bar.earH}%` }}
                      className="w-2 sm:w-2.5 bg-emerald-400/90 group-hover:bg-emerald-300 rounded-t-xs transition-all"
                      title={`EAR stability: ${bar.earH}%`}
                    />
                    {/* MAR Bar */}
                    <div
                      style={{ height: `${bar.marH}%` }}
                      className="w-2 sm:w-2.5 bg-cyan-400/80 group-hover:bg-cyan-300 rounded-t-xs transition-all"
                      title={`MAR activity: ${bar.marH}%`}
                    />
                    {/* Alert Bar */}
                    {bar.alertH > 0 && (
                      <div
                        style={{ height: `${bar.alertH}%` }}
                        className="w-2 sm:w-2.5 bg-red-400/90 group-hover:bg-red-300 rounded-t-xs transition-all"
                        title={`Alert instances: ${bar.alertH}%`}
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-parchment/50 mt-1">
                    {bar.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Col 4): Quick Action Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative rounded overflow-hidden border border-champagne/30 shadow-luxury-dark bg-obsidian">
            <img
              src="/images/coastal_sunset_tourer.jpg"
              alt="Automotive Cockpit Tourer"
              className="w-full h-80 object-cover object-center filter contrast-[1.05]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
              <span className="eyebrow text-champagne text-[10px] tracking-[0.2em] block">
                SAFER DRIVES &bull; A BRIGHTER TOMORROW
              </span>
              <p className="text-xs text-parchment/80 font-sans leading-relaxed">
                Elevating driver safety through real-time edge computer vision.
              </p>
              <button
                onClick={() => navigate('/app/monitor')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-champagne hover:bg-champagne-light text-obsidian text-xs font-semibold tracking-wide transition-all shadow-sm"
              >
                <Video className="w-4 h-4 text-obsidian" />
                <span>Launch Monitoring Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
