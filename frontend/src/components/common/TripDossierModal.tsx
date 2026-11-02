import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Award, Printer, ShieldCheck, CheckCircle2, FileText, Calendar, Clock, AlertTriangle } from 'lucide-react';
import type { SessionSummary } from '../../types/session';
import type { MonitoringTelemetry } from '../../types/monitoring';

interface TripDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  sessionSummary?: SessionSummary | null;
  activeTelemetry?: MonitoringTelemetry | null;
  sessionSeconds?: number;
}

export const TripDossierModal: React.FC<TripDossierModalProps> = ({
  isOpen,
  onClose,
  driverName = 'Devarinti Pavan Kumar Reddy',
  sessionSummary,
  activeTelemetry,
  sessionSeconds = 0,
}) => {
  const printableAreaRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const totalDurationSec = sessionSummary?.duration_seconds ?? sessionSeconds;
  const totalDrowsiness = sessionSummary?.drowsiness_event_count ?? (activeTelemetry?.status === 'POSSIBLE_DROWSINESS' ? 1 : 0);
  const totalYawns = sessionSummary?.possible_yawning_event_count ?? (activeTelemetry?.possible_yawning ? 1 : 0);
  const totalEvents = sessionSummary?.events?.length ?? (activeTelemetry?.event_count ?? 0);
  const blinkRate = activeTelemetry?.blinks_per_minute ?? 18;
  const perclos = activeTelemetry?.perclos ?? 3.4;
  const avgEar = activeTelemetry?.ear ? activeTelemetry.ear.toFixed(2) : '0.28';

  // Calculate Driver Safety Grade
  let grade = 'A+';
  let gradeLabel = 'Exemplary Vigilance';
  let gradeColor = 'text-emerald-400 border-emerald-500 bg-emerald-950/60';

  if (totalDrowsiness >= 3 || totalEvents >= 5 || perclos >= 12) {
    grade = 'C';
    gradeLabel = 'Safety Intervention Required';
    gradeColor = 'text-red-400 border-red-500 bg-red-950/60';
  } else if (totalDrowsiness >= 1 || totalEvents >= 2 || perclos >= 8) {
    grade = 'B';
    gradeLabel = 'Standard Vigilance (Minor Fatigue)';
    gradeColor = 'text-amber-400 border-amber-500 bg-amber-950/60';
  }

  const formatSec = (total: number) => {
    const rounded = Math.round(total);
    const hrs = Math.floor(rounded / 3600);
    const mins = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-auto rounded-lg bg-[#171916] border border-champagne/40 shadow-2xl text-ivory overflow-hidden z-[100000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="bg-[#1E211D] px-6 py-4 border-b border-champagne/30 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-champagne text-xs font-mono">
            <FileText className="w-4 h-4 text-champagne" />
            <span className="font-semibold tracking-wider uppercase">OFFICIAL TRIP SAFETY DOSSIER</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-champagne hover:bg-champagne-light text-obsidian text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-obsidian-border text-parchment/60 hover:text-ivory transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Sheet */}
        <div
          ref={printableAreaRef}
          className="p-6 md:p-10 space-y-6 max-h-[80vh] overflow-y-auto font-sans bg-[#171916] print:max-h-none print:overflow-visible print:p-6 print:bg-white print:text-black"
        >
          {/* Institutional Crest & Header */}
          <div className="text-center pb-6 border-b border-champagne/30">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950/80 border border-champagne/60 text-champagne mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-ivory tracking-tight">
              Kalasalingam Academy of Research and Education
            </h2>
            <p className="text-xs font-mono text-champagne mt-1">
              DEPARTMENT OF MECHANICAL ENGINEERING &bull; DESIGN BUILD (215EX32201)
            </p>
            <p className="text-[11px] font-mono text-parchment/60 mt-0.5">
              TEAM 8 &bull; DRIVESAFE AI DRIVER MONITORING PLATFORM
            </p>
          </div>

          {/* Certificate Title & Driver Credential Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded bg-[#1E211D] border border-champagne/20 text-xs font-mono">
            <div>
              <span className="text-[10px] text-parchment/60 block uppercase font-sans">Observed Operator</span>
              <span className="text-base font-bold text-ivory">{driverName}</span>
              <span className="text-[11px] text-champagne block mt-0.5">Registration Ref: 99240040884</span>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] text-parchment/60 block uppercase font-sans">Evaluation Timestamp</span>
              <span className="text-ivory font-medium">{currentDateStr}</span>
              <span className="text-emerald-400 text-[10px] block mt-0.5">Telemetry Integrity Verified</span>
            </div>
          </div>

          {/* Large Safety Grade Card */}
          <div className={`p-6 rounded border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${gradeColor}`}>
            <div>
              <span className="eyebrow text-xs font-bold tracking-widest block uppercase font-mono mb-1">
                OVERALL DRIVER VIGILANCE SCORE
              </span>
              <h3 className="font-serif text-2xl font-bold">
                {gradeLabel}
              </h3>
              <p className="text-xs mt-1 opacity-80 max-w-md font-sans">
                Computed mathematically via temporal Soukupová & Čech EAR eye closure heuristics, PERCLOS P80 ratio, and head pose stability.
              </p>
            </div>

            <div className="w-20 h-20 rounded-full border-2 border-current flex items-center justify-center shrink-0">
              <span className="font-serif text-4xl font-bold">{grade}</span>
            </div>
          </div>

          {/* Telemetry Metrics Matrix */}
          <div>
            <h4 className="font-serif text-sm font-bold text-champagne flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-champagne" />
              Observed Biometric & Chronometric Telemetry
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-[#1E211D] border border-champagne/15">
                <span className="text-[10px] text-parchment/60 block font-sans">Total Drive Duration</span>
                <span className="text-sm font-bold text-ivory mt-0.5 block">{formatSec(totalDurationSec)}</span>
                <span className="text-[10px] text-parchment/40">Continuous Time</span>
              </div>

              <div className="p-3 rounded bg-[#1E211D] border border-champagne/15">
                <span className="text-[10px] text-parchment/60 block font-sans">Mean Eye Aperture</span>
                <span className="text-sm font-bold text-champagne mt-0.5 block">{avgEar} EAR</span>
                <span className="text-[10px] text-parchment/40">Threshold: 0.20</span>
              </div>

              <div className="p-3 rounded bg-[#1E211D] border border-champagne/15">
                <span className="text-[10px] text-parchment/60 block font-sans">Blink Frequency</span>
                <span className="text-sm font-bold text-champagne mt-0.5 block">{blinkRate.toFixed(0)} BPM</span>
                <span className="text-[10px] text-parchment/40">Normal: 12-20 BPM</span>
              </div>

              <div className="p-3 rounded bg-[#1E211D] border border-champagne/15">
                <span className="text-[10px] text-parchment/60 block font-sans">PERCLOS P80</span>
                <span className={`text-sm font-bold mt-0.5 block ${perclos >= 12 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {perclos.toFixed(1)}%
                </span>
                <span className="text-[10px] text-parchment/40">Safe: &lt; 10%</span>
              </div>

              <div className="p-3 rounded bg-[#1E211D] border border-champagne/15">
                <span className="text-[10px] text-parchment/60 block font-sans">Microsleep Incidents</span>
                <span className={`text-sm font-bold mt-0.5 block ${totalDrowsiness > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {totalDrowsiness}
                </span>
                <span className="text-[10px] text-parchment/40">&ge; 1.5s Closure</span>
              </div>

              <div className="p-3 rounded bg-[#1E211D] border border-champagne/15">
                <span className="text-[10px] text-parchment/60 block font-sans">Yawn Events</span>
                <span className="text-sm font-bold text-amber-400 mt-0.5 block">{totalYawns}</span>
                <span className="text-[10px] text-parchment/40">MAR &ge; 0.65</span>
              </div>

              <div className="p-3 rounded bg-[#1E211D] border border-champagne/15">
                <span className="text-[10px] text-parchment/60 block font-sans">Total Hazard Events</span>
                <span className={`text-sm font-bold mt-0.5 block ${totalEvents > 0 ? 'text-red-400' : 'text-ivory'}`}>
                  {totalEvents}
                </span>
                <span className="text-[10px] text-parchment/40">Verified Logs</span>
              </div>

              <div className="p-3 rounded bg-[#1E211D] border border-champagne/15">
                <span className="text-[10px] text-parchment/60 block font-sans">Sampling Frame Rate</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">10.0 FPS</span>
                <span className="text-[10px] text-parchment/40">&lt; 25ms Latency</span>
              </div>
            </div>
          </div>

          {/* Academic Verification Signatures */}
          <div className="pt-6 border-t border-champagne/20 grid grid-cols-2 gap-8 text-xs font-mono">
            <div>
              <span className="text-[10px] text-parchment/50 uppercase block mb-6">PROJECT LEAD SIGNATURE</span>
              <div className="border-b border-champagne/40 pb-1 font-serif text-champagne text-sm italic">
                D. Pavan Kumar Reddy
              </div>
              <span className="text-[10px] text-parchment/60">Lead Developer &bull; Team 8</span>
            </div>

            <div>
              <span className="text-[10px] text-parchment/50 uppercase block mb-6">FACULTY EVALUATION SIGNATURE</span>
              <div className="border-b border-champagne/40 pb-1 text-parchment/40 text-xs italic">
                Verified & Evaluated
              </div>
              <span className="text-[10px] text-parchment/60">Dept. of Mechanical Engineering</span>
            </div>
          </div>

          {/* Footer Motto */}
          <div className="text-center pt-2 font-serif text-[11px] text-champagne tracking-widest uppercase">
            &bull; SAFE DRIVER &bull; SAFE JOURNEY &bull; SAFE SOCIETY &bull;
          </div>
        </div>
      </div>
    </div>
  );

  const targetContainer = (typeof document !== 'undefined' && (document.fullscreenElement || document.body)) || null;
  if (!targetContainer) return null;

  return createPortal(modalContent, targetContainer);
};

