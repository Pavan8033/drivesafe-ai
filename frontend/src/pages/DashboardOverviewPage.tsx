import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Clock,
  AlertTriangle,
  Activity,
  History,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Server,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/dashboard/MetricCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { getUserSessions } from '../lib/sessionStorage';
import type { SessionSummary } from '../types/session';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [engineHealth, setEngineHealth] = useState<{
    status: string;
    modelLoaded: boolean;
    version: string;
  } | null>(null);

  useEffect(() => {
    // 1. Fetch user sessions
    if (user?.uid) {
      getUserSessions(user.uid).then((data) => {
        setSessions(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    // 2. Fetch FastAPI backend health
    fetch(`${API_BASE}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        setEngineHealth({
          status: data.status,
          modelLoaded: data.model_loaded,
          version: data.version,
        });
      })
      .catch(() => {
        setEngineHealth({
          status: 'UNAVAILABLE',
          modelLoaded: false,
          version: '1.0.0',
        });
      });
  }, [user]);

  // Aggregate stats from real sessions
  const totalSessionsCount = sessions.length;
  const totalDrowsinessEvents = sessions.reduce(
    (acc, s) => acc + (s.drowsiness_event_count || 0),
    0
  );
  const totalYawnEvents = sessions.reduce(
    (acc, s) => acc + (s.possible_yawning_event_count || 0),
    0
  );
  const totalDurationSeconds = sessions.reduce(
    (acc, s) => acc + (s.duration_seconds || 0),
    0
  );

  const formatTotalTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Readiness Hero Card */}
      <div className="relative p-6 md:p-8 rounded bg-gradient-to-r from-forest-dark via-charcoal to-charcoal border border-gold/30 shadow-luxury flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="eyebrow text-gold text-[10px] tracking-widest">
              MONITORING STATUS &bull; COCKPIT READY
            </span>
            {user?.isDemoUser && (
              <span className="px-2 py-0.5 rounded bg-gold/15 text-gold-light border border-gold/30 text-[10px] font-mono">
                DEMO PROFILE
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-ivory">
            Welcome, {user?.displayName || 'Honored Driver'}
          </h2>
          <p className="text-xs md:text-sm text-parchment/70 max-w-xl font-sans leading-relaxed">
            All optical landmark sensors, eye aspect ratio analyzers, and acoustic warning chimes are calibrated. Ready to monitor active travel.
          </p>
        </div>

        <div className="shrink-0 z-10">
          <PrimaryButton
            size="lg"
            variant="forest"
            onClick={() => navigate('/app/monitor')}
            icon={<Video className="w-5 h-5 text-gold" />}
          >
            Launch Monitoring Studio
          </PrimaryButton>
        </div>
      </div>

      {/* Primary Telemetry Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          label="Total Monitored Sessions"
          value={totalSessionsCount}
          subtext="Saved in driver session archives"
          icon={<History className="w-4 h-4" />}
          status="neutral"
        />

        <MetricCard
          label="Cumulative Surveillance Time"
          value={formatTotalTime(totalDurationSeconds)}
          subtext="Total active observation elapsed"
          icon={<Clock className="w-4 h-4" />}
          status="neutral"
        />

        <MetricCard
          label="Prolonged Closure Events"
          value={totalDrowsinessEvents}
          subtext="Closures sustained &ge; 1.5s"
          icon={<AlertTriangle className="w-4 h-4" />}
          status={totalDrowsinessEvents > 0 ? 'warning' : 'safe'}
        />

        <MetricCard
          label="Possible Yawning Instances"
          value={totalYawnEvents}
          subtext="Elevated MAR respiratory events"
          icon={<Activity className="w-4 h-4" />}
          status="neutral"
        />
      </div>

      {/* Two Column Layout: Recent Sessions + System Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Sessions List (Col 7) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-charcoal-border">
            <h3 className="font-serif text-lg font-medium text-ivory">
              Recent Monitoring Sessions
            </h3>
            <button
              onClick={() => navigate('/app/history')}
              className="text-xs text-gold hover:text-gold-light flex items-center gap-1 transition-colors"
            >
              <span>View Full Archive</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-parchment/50">
              Loading session archive...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 rounded bg-charcoal-card border border-dashed border-gold/20 text-center">
              <History className="w-8 h-8 text-gold/40 mx-auto mb-2" />
              <p className="text-xs text-parchment/60 font-sans">
                No active surveillance sessions recorded yet. Launch the studio to commence your first run.
              </p>
              <button
                onClick={() => navigate('/app/monitor')}
                className="mt-4 px-4 py-2 text-xs rounded bg-forest text-ivory border border-gold/30 hover:bg-forest-light transition-colors"
              >
                Start First Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.session_id}
                  className="p-4 rounded bg-charcoal-card border border-gold/15 hover:border-gold/40 transition-colors flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ivory font-medium">
                        {session.start_timestamp}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-[9px] font-mono">
                        {session.session_status}
                      </span>
                    </div>
                    <span className="text-[11px] text-parchment/50 font-sans block">
                      Duration: {Math.round(session.duration_seconds)}s &bull; Events:{' '}
                      {session.drowsiness_event_count} drowsiness,{' '}
                      {session.possible_yawning_event_count} yawns
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/app/history')}
                    className="p-2 text-parchment/50 hover:text-gold transition-colors text-xs font-mono"
                    title="Inspect session record"
                  >
                    View &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Diagnostics & Backend Readiness (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="pb-2 border-b border-charcoal-border">
            <h3 className="font-serif text-lg font-medium text-ivory">
              Telemetry Diagnostics
            </h3>
          </div>

          <div className="p-5 rounded bg-charcoal-card border border-gold/20 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-border">
              <span className="text-parchment/70">Python FastAPI Engine</span>
              <span
                className={`font-mono font-medium ${
                  engineHealth?.status === 'HEALTHY'
                    ? 'text-emerald-400'
                    : engineHealth?.status === 'DEGRADED'
                    ? 'text-amber-400'
                    : 'text-stone-400'
                }`}
              >
                {engineHealth?.status || 'CHECKING...'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-charcoal-border">
              <span className="text-parchment/70">Face Landmarker Model</span>
              <span
                className={`font-mono font-medium ${
                  engineHealth?.modelLoaded ? 'text-emerald-400' : 'text-stone-400'
                }`}
              >
                {engineHealth?.modelLoaded ? 'ACTIVE (478 pts)' : 'STANDBY'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-charcoal-border">
              <span className="text-parchment/70">Web Audio Alert Chimes</span>
              <span className="font-mono text-emerald-400 font-medium">
                INITIALIZED
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-parchment/70">Vigilance Protocol</span>
              <span className="font-mono text-gold font-medium">
                Soukupov&aacute; EAR (0.20)
              </span>
            </div>

            <div className="p-3 mt-4 rounded bg-charcoal-elevated border border-charcoal-border text-[11px] text-parchment/60 leading-normal">
              <strong>Hardware Privacy Guarantee:</strong> Video frames are processed in-session over an isolated local loopback. No biometric data is stored remotely without consent.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
