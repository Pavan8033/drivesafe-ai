import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  Compass,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions } from '../lib/sessionStorage';
import { MetricCard } from '../components/dashboard/MetricCard';
import type { SessionSummary } from '../types/session';

export const InsightsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getUserSessions(user.uid).then((data) => {
        setSessions(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Calculations from real sessions
  const totalSessions = sessions.length;
  const totalEvents = sessions.reduce(
    (acc, s) => acc + s.drowsiness_event_count + s.possible_yawning_event_count,
    0
  );
  const avgDuration =
    totalSessions > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.duration_seconds, 0) / totalSessions
        )
      : 0;

  const avgEventsPerSession =
    totalSessions > 0 ? (totalEvents / totalSessions).toFixed(1) : '0.0';

  // Vigilance Score heuristic: (1 - events/(duration_in_mins * 2)) * 100 clamped to 60-99
  const totalDurationMins = Math.max(
    1,
    sessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60
  );
  const vigilanceIndex =
    totalSessions > 0
      ? Math.max(65, Math.min(99, Math.round(100 - (totalEvents / totalDurationMins) * 15)))
      : 98;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-charcoal-border">
        <div className="flex items-center gap-2">
          <span className="eyebrow text-gold text-[10px] tracking-widest">
            ANALYTICAL MANIFEST
          </span>
          <span className="text-[10px] font-mono text-parchment/40">
            {totalSessions > 0 ? 'REAL USER DATA' : 'ILLUSTRATIVE GUIDE'}
          </span>
        </div>
        <h2 className="font-serif text-2xl font-medium text-ivory mt-1">
          Fatigue & Alertness Trends
        </h2>
        <p className="text-xs text-parchment/60 font-sans mt-0.5">
          Mathematical telemetry modeling palpebral aperture stability and prolonged closure incidence.
        </p>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          label="Session Stability Ratio (Experimental)"
          value={`${vigilanceIndex}%`}
          subtext="Heuristic stability ratio (Non-clinical)"
          icon={<Compass className="w-4 h-4 text-emerald-400" />}
          status="safe"
        />

        <MetricCard
          label="Mean Session Duration"
          value={avgDuration}
          unit="sec"
          subtext="Average surveillance interval"
          icon={<Clock className="w-4 h-4" />}
          status="neutral"
        />

        <MetricCard
          label="Average Events Per Run"
          value={avgEventsPerSession}
          subtext="Qualifying warnings triggered"
          icon={<AlertTriangle className="w-4 h-4" />}
          status={Number(avgEventsPerSession) > 1 ? 'warning' : 'safe'}
        />

        <MetricCard
          label="Total Logged Incidents"
          value={totalEvents}
          subtext="Across all archived sessions"
          icon={<TrendingUp className="w-4 h-4" />}
          status="neutral"
        />
      </div>

      {/* Visual Chart Deck: Chronological Session Durations */}
      <div className="p-6 rounded bg-charcoal-card border border-gold/25 shadow-luxury-dark space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
          <div>
            <h3 className="font-serif text-lg font-medium text-ivory">
              Session Duration Distribution
            </h3>
            <p className="text-xs text-parchment/50 font-sans mt-0.5">
              Elapsed observation duration (in seconds) per historical session run.
            </p>
          </div>
          <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-1 rounded border border-gold/30">
            {totalSessions} Recorded Sessions
          </span>
        </div>

        {totalSessions === 0 ? (
          <div className="p-12 text-center text-xs text-parchment/50 font-sans">
            No historical sessions found. Run a monitoring session in the studio to populate custom analytics.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-48 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-charcoal-border overflow-x-auto">
              {sessions.slice(0, 10).reverse().map((s, idx) => {
                const maxSec = Math.max(30, ...sessions.map((x) => x.duration_seconds));
                const heightPct = Math.max(15, Math.min(100, (s.duration_seconds / maxSec) * 100));
                const hasDrowsiness = s.drowsiness_event_count > 0;

                return (
                  <div key={s.session_id} className="flex-1 flex flex-col items-center gap-2 group min-w-[36px]">
                    <span className="text-[10px] font-mono text-parchment/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round(s.duration_seconds)}s
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all duration-300 ${
                        hasDrowsiness
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                          : 'bg-gradient-to-t from-forest-light to-gold'
                      }`}
                      title={`${s.start_timestamp}: ${Math.round(s.duration_seconds)}s, ${s.drowsiness_event_count} alerts`}
                    />
                    <span className="text-[9px] font-mono text-parchment/40">
                      #{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-parchment/50 font-mono pt-2">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gold" />
                <span>Standard Vigilant Run</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>Run with Drowsiness Warning</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Advisory & Scientific Citation */}
      <div className="p-6 rounded bg-charcoal-elevated border border-charcoal-border text-xs text-parchment/70 font-sans leading-relaxed space-y-2">
        <h4 className="font-serif text-sm font-semibold text-gold">
          Biometric Research Methodology Note
        </h4>
        <p>
          DriveSafe AI measures palpebral aperture utilizing the Euclidean distance formulation of Soukupov&aacute; &amp; &Ccaron;ech (2016). Prolonged eye closures exceeding 1.5 seconds reflect significant declines in cortical activation. However, physiological variation across individuals, lighting angles, and eyewear can influence baseline EAR. Always calibrate your threshold in Settings if required.
        </p>
        <p className="text-[11px] text-parchment/50 pt-1">
          <strong>Note on Session Stability Ratio:</strong> This experimental indicator represents a normalized demonstration score derived from event frequency relative to observation duration <span className="font-mono">(100 - [events / minutes] &times; 15)</span>. It is an algorithmic heuristic for demonstration purposes and is NOT a certified or clinically validated measure of driver fitness.
        </p>
      </div>
    </div>
  );
};
