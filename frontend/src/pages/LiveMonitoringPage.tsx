import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Clock,
  Eye,
  CheckCircle,
  Save,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { MonitoringViewport } from '../components/monitoring/MonitoringViewport';
import { EarGauge } from '../components/monitoring/EarGauge';
import { MetricCard } from '../components/dashboard/MetricCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { saveSessionSummary } from '../lib/sessionStorage';
import type { MonitoringTelemetry } from '../types/monitoring';
import type { SessionSummary } from '../types/session';

export const LiveMonitoringPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [telemetry, setTelemetry] = useState<MonitoringTelemetry | null>(null);
  const [completedSummary, setCompletedSummary] = useState<SessionSummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTelemetryUpdate = (data: MonitoringTelemetry) => {
    setTelemetry(data);
  };

  const handleSessionComplete = async (summary: SessionSummary) => {
    setCompletedSummary(summary);
    // Auto-save summary for user
    if (user?.uid) {
      setIsSaving(true);
      await saveSessionSummary(user.uid, summary);
      setIsSaving(false);
      setSaveSuccess(true);
    }
  };

  const ear = telemetry?.ear ?? null;
  const leftEar = telemetry?.left_ear ?? null;
  const rightEar = telemetry?.right_ear ?? null;
  const mar = telemetry?.mouth_aspect_ratio ?? null;
  const closureMs = telemetry?.eye_closure_duration_ms ?? 0;
  const status = telemetry?.status || 'UNKNOWN';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Alert for Active Monitoring */}
      {status === 'POSSIBLE_DROWSINESS' && (
        <div className="p-4 rounded bg-red-950/90 border-2 border-red-500 shadow-danger-glow flex items-center justify-between text-ivory animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <span className="font-serif font-semibold text-base block">
                DROWSINESS HAZARD DETECTED
              </span>
              <span className="text-xs text-red-200">
                Driver eyelid closure sustained beyond 1.50 seconds. Acoustic alert triggered.
              </span>
            </div>
          </div>
          <span className="text-xs font-mono bg-red-900 px-3 py-1 rounded border border-red-400">
            {closureMs} ms
          </span>
        </div>
      )}

      {/* Main Studio Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Camera Viewport (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          <MonitoringViewport
            onTelemetryUpdate={handleTelemetryUpdate}
            onSessionComplete={handleSessionComplete}
            isSoundMuted={false}
          />

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              label="Combined EAR"
              value={ear !== null ? ear.toFixed(3) : '\u2014'}
              subtext="Threshold: 0.20"
              icon={<Eye className="w-4 h-4" />}
              status={ear !== null && ear < 0.20 ? 'danger' : 'safe'}
            />

            <MetricCard
              label="Closure Time"
              value={telemetry ? `${closureMs}` : '\u2014'}
              unit="ms"
              subtext="Continuous closure duration"
              icon={<Clock className="w-4 h-4" />}
              status={closureMs > 1000 ? 'danger' : 'neutral'}
            />

            <MetricCard
              label="Mouth Ratio (MAR)"
              value={mar !== null ? mar.toFixed(3) : '\u2014'}
              subtext="Yawn Threshold: 0.65"
              icon={<Activity className="w-4 h-4" />}
              status={telemetry?.possible_yawning ? 'warning' : 'neutral'}
            />

            <MetricCard
              label="Events Logged"
              value={telemetry ? telemetry.event_count : 0}
              subtext="Drowsiness or Yawn events"
              icon={<AlertTriangle className="w-4 h-4" />}
              status={telemetry && telemetry.event_count > 0 ? 'warning' : 'neutral'}
            />
          </div>
        </div>

        {/* Right Column: Analog Gauge + Real-time Dial (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <EarGauge
            ear={ear}
            leftEar={leftEar}
            rightEar={rightEar}
            threshold={0.20}
          />

          {/* Live Analysis Diagnostic Box */}
          <div className="p-5 rounded bg-charcoal-card border border-gold/20 space-y-4">
            <span className="eyebrow text-gold text-[10px] tracking-widest block">
              DIAGNOSTIC TELEMETRY
            </span>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between pb-2 border-b border-charcoal-border">
                <span className="text-parchment/60 font-sans">Facial Detection:</span>
                <span className={telemetry?.face_detected ? 'text-emerald-400' : 'text-stone-400'}>
                  {telemetry?.face_detected ? 'FACE LOCKED (1)' : 'NO FACE DETECTED'}
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-charcoal-border">
                <span className="text-parchment/60 font-sans">System Status:</span>
                <span className="text-ivory font-semibold">{status}</span>
              </div>

              <div className="flex justify-between pb-2 border-b border-charcoal-border">
                <span className="text-parchment/60 font-sans">Processing Latency:</span>
                <span className="text-gold">{telemetry?.processing_time_ms ?? 0} ms</span>
              </div>

              <div className="flex justify-between pb-2 border-b border-charcoal-border">
                <span className="text-parchment/60 font-sans">Session Duration:</span>
                <span className="text-ivory">
                  {Math.round(telemetry?.session_duration_seconds ?? 0)} seconds
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-parchment/60 font-sans">Yawning State:</span>
                <span className={telemetry?.possible_yawning ? 'text-amber-400' : 'text-stone-400'}>
                  {telemetry?.possible_yawning ? 'POSSIBLE YAWN' : 'NORMAL'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-charcoal-elevated border border-charcoal-border text-[11px] text-parchment/50 font-sans leading-normal">
              <strong>Testing Tip:</strong> To demonstrate alertness monitoring safely from your desk, deliberately close your eyes for 2 seconds. The chronometer will record the closure and sound the alert chime.
            </div>
          </div>
        </div>
      </div>

      {/* Session Completed Summary Modal */}
      {completedSummary && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal border-2 border-gold/40 p-6 md:p-8 rounded max-w-lg w-full shadow-2xl text-ivory space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-gold/20">
              <div className="w-10 h-10 rounded-full bg-forest text-gold border border-gold/40 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="eyebrow text-gold text-[10px] tracking-widest block">
                  SURVEILLANCE COMPLETED
                </span>
                <h3 className="font-serif text-2xl font-medium text-ivory">
                  Session Summary
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded bg-charcoal-elevated border border-charcoal-border">
                <span className="text-parchment/50 block font-sans text-[10px]">Session ID</span>
                <span className="text-gold font-medium truncate block">
                  {completedSummary.session_id}
                </span>
              </div>

              <div className="p-3 rounded bg-charcoal-elevated border border-charcoal-border">
                <span className="text-parchment/50 block font-sans text-[10px]">Elapsed Time</span>
                <span className="text-ivory font-semibold block">
                  {Math.round(completedSummary.duration_seconds)} seconds
                </span>
              </div>

              <div className="p-3 rounded bg-charcoal-elevated border border-charcoal-border">
                <span className="text-parchment/50 block font-sans text-[10px]">Drowsiness Events</span>
                <span className="text-amber-400 font-semibold text-lg block">
                  {completedSummary.drowsiness_event_count}
                </span>
              </div>

              <div className="p-3 rounded bg-charcoal-elevated border border-charcoal-border">
                <span className="text-parchment/50 block font-sans text-[10px]">Yawning Events</span>
                <span className="text-gold font-semibold text-lg block">
                  {completedSummary.possible_yawning_event_count}
                </span>
              </div>
            </div>

            {/* Saved Notification */}
            {saveSuccess && (
              <div className="p-3 rounded bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Session telemetry safely persisted to driver history archive.</span>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gold/20">
              <button
                onClick={() => setCompletedSummary(null)}
                className="flex-1 py-2.5 rounded border border-gold/30 hover:bg-charcoal-elevated text-xs font-medium text-ivory transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gold" />
                <span>Dismiss & Retest</span>
              </button>

              <PrimaryButton
                size="md"
                variant="forest"
                onClick={() => navigate('/app/history')}
                className="flex-1"
              >
                Inspect History Archive &rarr;
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
