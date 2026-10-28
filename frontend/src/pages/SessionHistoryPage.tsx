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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions, deleteUserSession } from '../lib/sessionStorage';
import { EmptyState } from '../components/dashboard/EmptyState';
import { PrimaryButton } from '../components/common/PrimaryButton';
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
    const ok = window.confirm('Are you certain you wish to purge this session record from your archive?');
    if (!ok) return;

    await deleteUserSession(user.uid, sessionId);
    setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    if (selectedSession?.session_id === sessionId) {
      setSelectedSession(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Refresh Deck */}
      <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
        <div>
          <h2 className="font-serif text-2xl font-medium text-ivory">
            Driver Telemetry Archives
          </h2>
          <p className="text-xs text-parchment/60 font-sans mt-0.5">
            Historical logs of all verified driver alertness surveillance sessions.
          </p>
        </div>

        <button
          onClick={fetchSessions}
          className="p-2 rounded bg-charcoal-elevated border border-gold/25 text-gold hover:text-ivory hover:border-gold/50 text-xs font-mono flex items-center gap-2 transition-colors"
          title="Refresh Archive"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Archive</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-parchment/50">
          Accessing historical records...
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No Archives Recorded"
          description="Your driving telemetry record is currently clear. Once you engage and conclude a session in the Monitoring Studio, the full duration and event log will appear here."
          actionText="Open Monitoring Studio"
          onAction={() => navigate('/app/monitor')}
          icon={<History className="w-8 h-8 text-gold" />}
        />
      ) : (
        <div className="rounded border border-gold/25 bg-charcoal-card overflow-hidden shadow-luxury-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-charcoal-elevated text-gold text-[10px] uppercase font-mono tracking-wider border-b border-charcoal-border">
                <tr>
                  <th className="py-3.5 px-4 md:px-6">Timestamp / Date</th>
                  <th className="py-3.5 px-4">Session Duration</th>
                  <th className="py-3.5 px-4 text-center">Drowsiness Events</th>
                  <th className="py-3.5 px-4 text-center">Yawning Instances</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border font-mono text-parchment/80">
                {sessions.map((session) => (
                  <tr
                    key={session.session_id}
                    className="hover:bg-charcoal-elevated/50 transition-colors"
                  >
                    <td className="py-4 px-4 md:px-6 font-medium text-ivory">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gold/70 shrink-0" />
                        <span>{session.start_timestamp}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-parchment/50" />
                        <span>{Math.round(session.duration_seconds)}s</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          session.drowsiness_event_count > 0
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50'
                            : 'text-parchment/50'
                        }`}
                      >
                        {session.drowsiness_event_count}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          session.possible_yawning_event_count > 0
                            ? 'bg-gold/10 text-gold border border-gold/30'
                            : 'text-parchment/50'
                        }`}
                      >
                        {session.possible_yawning_event_count}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-[10px]">
                        {session.session_status}
                      </span>
                    </td>

                    <td className="py-4 px-4 md:px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="px-2.5 py-1 rounded bg-charcoal hover:bg-gold/10 text-gold border border-gold/30 text-[11px] transition-colors"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => handleDelete(session.session_id)}
                        className="p-1 rounded text-parchment/40 hover:text-red-400 transition-colors"
                        title="Purge session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal border-2 border-gold/40 p-6 md:p-8 rounded max-w-lg w-full shadow-2xl text-ivory space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gold/20">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gold" />
                <h3 className="font-serif text-xl font-medium text-ivory">
                  Telemetry Manifest
                </h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1 rounded text-parchment/60 hover:text-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-charcoal-border">
                <span className="text-parchment/60 font-sans">Session Identifier:</span>
                <span className="text-gold font-medium truncate max-w-[200px]">
                  {selectedSession.session_id}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-charcoal-border">
                <span className="text-parchment/60 font-sans">Start Timestamp:</span>
                <span className="text-ivory">{selectedSession.start_timestamp}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-charcoal-border">
                <span className="text-parchment/60 font-sans">Concluded Timestamp:</span>
                <span className="text-ivory">{selectedSession.end_timestamp || '\u2014'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-charcoal-border">
                <span className="text-parchment/60 font-sans">Duration:</span>
                <span className="text-ivory">
                  {Math.round(selectedSession.duration_seconds)} seconds
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-charcoal-border">
                <span className="text-parchment/60 font-sans">Drowsiness Events:</span>
                <span className="text-amber-400 font-semibold">
                  {selectedSession.drowsiness_event_count}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-parchment/60 font-sans">Yawning Events:</span>
                <span className="text-gold font-semibold">
                  {selectedSession.possible_yawning_event_count}
                </span>
              </div>
            </div>

            {/* Event sub-items if present */}
            {selectedSession.events && selectedSession.events.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gold/20">
                <span className="eyebrow text-gold text-[10px] tracking-widest block">
                  CHRONOLOGICAL EVENT LOG
                </span>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {selectedSession.events.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded bg-charcoal-elevated border border-charcoal-border text-[11px] font-mono flex items-center justify-between"
                    >
                      <div>
                        <span className="text-amber-400 font-medium block">{evt.type}</span>
                        <span className="text-parchment/50 text-[10px]">{evt.details}</span>
                      </div>
                      <span className="text-parchment/40 text-[10px]">{evt.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gold/20 flex justify-end">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-5 py-2 rounded bg-forest hover:bg-forest-light text-ivory text-xs font-medium border border-gold/30 transition-colors"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
