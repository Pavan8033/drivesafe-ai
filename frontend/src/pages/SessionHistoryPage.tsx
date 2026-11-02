import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Trash2,
  Eye,
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions, deleteUserSession } from '../lib/sessionStorage';
import { EmptyState } from '../components/dashboard/EmptyState';
import type { SessionSummary } from '../types/session';

export const SessionHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);

  const fetchSessions = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getUserSessions(user.uid);
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const handleDelete = async (sessionId: string) => {
    if (!user?.uid) return;
    const ok = window.confirm(
      'Are you certain you wish to purge this session record from your archive?'
    );
    if (!ok) return;

    await deleteUserSession(user.uid, sessionId);
    setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    if (selectedSession?.session_id === sessionId) {
      setSelectedSession(null);
    }
  };

  const displayList = sessions;

  const formatDuration = (seconds: number) => {
    const rounded = Math.round(seconds);
    if (rounded <= 0) return '0m 00s';
    const hrs = Math.floor(rounded / 3600);
    const mins = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = (statusName: string, eventCount: number) => {
    const normalized = (statusName || '').toLowerCase();
    if (normalized.includes('attention') || eventCount >= 5) {
      return (
        <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-medium">
          Attention
        </span>
      );
    }
    if (normalized.includes('reviewed')) {
      return (
        <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-mono font-medium">
          Reviewed
        </span>
      );
    }
    if (normalized.includes('vigilant') || eventCount === 0) {
      return (
        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-medium">
          Vigilant
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-800 border border-stone-300 text-[10px] font-mono font-medium">
        Completed
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Session History Container */}
      <div className="p-6 md:p-8 rounded bg-parchment/60 border border-champagne/30 shadow-luxury text-obsidian">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-champagne/25 mb-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-obsidian">
              Session History
            </h2>
            <p className="text-xs text-secondary-text font-sans mt-0.5">
              View and analyze your past monitoring sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSessions}
              className="p-2 rounded bg-ivory border border-champagne/30 text-champagne-dark hover:text-obsidian hover:border-champagne text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Refresh Archives"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => navigate('/app/monitor')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-champagne hover:bg-champagne-light text-obsidian text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {displayList.length === 0 ? (
          <EmptyState
            title="No Session Telemetry Recorded"
            description="When you engage the live monitoring studio, your driving vigilance telemetry, duration, and fatigue events will be safely archived here."
            actionText="Launch Monitoring Studio"
            onAction={() => navigate('/app/monitor')}
          />
        ) : (
          /* Parchment Styled Table Matching Reference */
          <div className="overflow-x-auto rounded border border-champagne/25 bg-ivory shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-parchment/70 text-obsidian font-serif text-xs font-semibold border-b border-champagne/30">
                <tr>
                  <th className="py-3.5 px-4 md:px-6">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4 text-center">Events</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne/15 font-mono text-obsidian">
                {displayList.map((session) => {
                  const totalEvents =
                    (session.drowsiness_event_count || 0) +
                    (session.possible_yawning_event_count || 0);

                  return (
                    <tr
                      key={session.session_id}
                      className="hover:bg-parchment/40 transition-colors"
                    >
                      <td className="py-4 px-4 md:px-6 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-champagne-dark shrink-0" />
                          <span>{session.start_timestamp}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-secondary-text">
                        {formatDuration(session.duration_seconds)}
                      </td>

                      <td className="py-4 px-4 text-center font-semibold">
                        {totalEvents}
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(session.session_status, totalEvents)}
                      </td>

                      <td className="py-4 px-4 md:px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="p-1.5 rounded hover:bg-parchment text-secondary-text hover:text-emerald transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(session.session_id)}
                            className="p-1.5 rounded hover:bg-red-50 text-secondary-text hover:text-red-700 transition-colors"
                            title="Purge Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal if Selected */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-obsidian/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-obsidian-card border border-champagne/30 rounded p-6 shadow-luxury-dark space-y-4 text-ivory">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <h3 className="font-serif text-lg font-medium text-ivory">
                Session Inspection Log
              </h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1 text-parchment/60 hover:text-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-obsidian-border">
                <span className="text-parchment/60 font-sans">Session ID:</span>
                <span>{selectedSession.session_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-obsidian-border">
                <span className="text-parchment/60 font-sans">Timestamp:</span>
                <span>{selectedSession.start_timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-obsidian-border">
                <span className="text-parchment/60 font-sans">Duration:</span>
                <span>{Math.round(selectedSession.duration_seconds)} seconds</span>
              </div>
              <div className="flex justify-between py-1 border-b border-obsidian-border">
                <span className="text-parchment/60 font-sans">Drowsiness Events:</span>
                <span className="text-red-400">{selectedSession.drowsiness_event_count}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-obsidian-border">
                <span className="text-parchment/60 font-sans">Yawns Detected:</span>
                <span className="text-champagne">{selectedSession.possible_yawning_event_count}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-parchment/60 font-sans">Status:</span>
                <span className="text-emerald-400">{selectedSession.session_status}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedSession(null)}
              className="w-full py-2.5 rounded bg-champagne hover:bg-champagne-light text-obsidian text-xs font-semibold"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* Bottom Automotive Cockpit Banner Matching Reference Image */}
      <div className="relative rounded overflow-hidden border border-champagne/30 shadow-luxury-dark bg-obsidian">
        <img
          src="/images/vintage_luxury_cockpit.jpg"
          alt="Vintage luxury automobile interior with handcrafted wood and leather"
          className="w-full h-48 md:h-56 object-cover object-center filter brightness-[0.55] contrast-[1.1]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/60 to-transparent" />

        <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-xl">
          <span className="eyebrow text-champagne text-[10px] tracking-[0.25em] block mb-2">
            HERITAGE MOTORING WISDOM
          </span>
          <h3 className="font-serif text-2xl md:text-3xl font-medium text-ivory tracking-tight">
            A safer tomorrow begins with awareness today.
          </h3>
        </div>
      </div>
    </div>
  );
};
