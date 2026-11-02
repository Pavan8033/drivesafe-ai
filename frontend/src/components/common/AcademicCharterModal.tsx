import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Award, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AcademicCharterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicCharterModal: React.FC<AcademicCharterModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const teamMembers = [
    { sNo: 1, name: 'DEVARINTI PAVAN KUMAR REDDY', regNo: '99240040884', role: 'Team Lead & Full-Stack Architect' },
    { sNo: 2, name: 'D D N V PHANI KUMAR', regNo: '99240040886', role: 'Computer Vision & AI Telemetry' },
    { sNo: 3, name: 'CHUNDRU KARTHIK', regNo: '99240041085', role: 'Embedded Systems & Sensor Integration' },
    { sNo: 4, name: 'DODDAVULA DINESH REDDY', regNo: '99240040894', role: 'Safety Ergonomics & Driver Testing' },
    { sNo: 5, name: 'DEVARASETTY BALA NARASIMHULU', regNo: '9924005420', role: 'Mechanical Mounting & Hardware Design' },
    { sNo: 6, name: 'THOTA SRAVAN KUMAR', regNo: '9924005377', role: 'System Quality Assurance & Verification' },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-auto rounded-lg bg-[#171916] border border-champagne/40 shadow-2xl text-ivory overflow-hidden z-[100000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Header Strip */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#1E211D] to-emerald-950 px-6 py-5 border-b border-champagne/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-900/80 border border-champagne/60 flex items-center justify-center text-champagne shadow-sm shrink-0">
              <Award className="w-5 h-5 text-champagne" />
            </div>
            <div>
              <span className="eyebrow text-champagne text-[11px] font-bold tracking-widest block font-mono">
                TEAM 8 &bull; DESIGN BUILD
              </span>
              <h2 className="font-serif text-lg md:text-xl font-bold text-ivory">
                Kalasalingam Academy of Research and Education
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-obsidian-elevated/80 hover:bg-obsidian-elevated border border-champagne/30 text-parchment hover:text-ivory transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto font-sans bg-[#171916]">
          {/* Institutional Badge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded bg-[#1E211D] border border-champagne/25 shadow-sm">
              <span className="text-parchment/60 block text-[10px] tracking-wider uppercase font-sans">Institution</span>
              <span className="font-bold text-ivory block mt-0.5">Deemed to be University</span>
              <span className="text-emerald-400 text-[10px] block mt-0.5 font-semibold">NAAC "A++" Accredited</span>
            </div>

            <div className="p-3.5 rounded bg-[#1E211D] border border-champagne/25 shadow-sm">
              <span className="text-parchment/60 block text-[10px] tracking-wider uppercase font-sans">Department & Course</span>
              <span className="font-bold text-ivory block mt-0.5">Mechanical Engineering</span>
              <span className="text-champagne text-[10px] block mt-0.5 font-semibold">215EX32201 — Design Build</span>
            </div>

            <div className="p-3.5 rounded bg-[#1E211D] border border-champagne/25 shadow-sm">
              <span className="text-parchment/60 block text-[10px] tracking-wider uppercase font-sans">Design Unit</span>
              <span className="font-bold text-champagne text-base block mt-0.5">TEAM 8</span>
            </div>
          </div>

          {/* Problem Statement & Background */}
          <div className="p-4 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs leading-relaxed space-y-2">
            <h4 className="font-serif text-sm font-bold text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Problem Statement & Research Motivation
            </h4>
            <p className="text-parchment/90">
              Driver fatigue and drowsiness are major causes of road accidents. Traditional safety systems (such as vehicle black boxes) record data only after a collision occurs, and lane departure warnings cannot measure driver cognitive alertness.
            </p>
            <p className="text-parchment/90">
              <strong>DriveSafe AI (Team 8)</strong> is an intelligent, low-cost, non-intrusive safety platform that mathematically monitors eye closure (EAR), natural blinking patterns, PERCLOS P80, and yawning (MAR) to alert the driver in real time before accidents happen.
            </p>
          </div>

          {/* Team Members & Registration Numbers */}
          <div>
            <h4 className="font-serif text-sm font-bold text-champagne flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-champagne" />
              Team 8 Roster & Registration Numbers
            </h4>

            <div className="overflow-x-auto rounded border border-champagne/25 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E211D] text-champagne border-b border-champagne/25 font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">S. No.</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Registration No.</th>
                    <th className="py-2.5 px-3">Project Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E332B] font-sans bg-[#171916]">
                  {teamMembers.map((m) => (
                    <tr key={m.sNo} className="hover:bg-[#1E211D]/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-parchment/60">{m.sNo}</td>
                      <td className="py-2.5 px-3 font-semibold text-ivory">{m.name}</td>
                      <td className="py-2.5 px-3 font-mono text-champagne font-medium">{m.regNo}</td>
                      <td className="py-2.5 px-3 text-parchment/75 text-[11px]">{m.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Architectural Verifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-parchment/80">
            <div className="flex items-center gap-2 p-2.5 rounded bg-[#1E211D] border border-champagne/15">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>MediaPipe 478-Point 3D Face Landmarker</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded bg-[#1E211D] border border-champagne/15">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Soukupová & Čech (2016) EAR Formulation</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded bg-[#1E211D] border border-champagne/15">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>NHTSA Standard PERCLOS P80 Window</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded bg-[#1E211D] border border-champagne/15">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>FastAPI WebSocket Duplex Telemetry (&lt;25ms)</span>
            </div>
          </div>

          {/* University Project Motto */}
          <div className="pt-4 border-t border-champagne/20 flex flex-wrap items-center justify-around gap-4 text-center font-serif text-xs font-semibold text-champagne tracking-widest uppercase">
            <span>&bull; SAFE DRIVER &bull;</span>
            <span>&bull; SAFE JOURNEY &bull;</span>
            <span>&bull; SAFE SOCIETY &bull;</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Portal to fullscreen container if active, otherwise document.body
  const targetContainer = (typeof document !== 'undefined' && (document.fullscreenElement || document.body)) || null;
  if (!targetContainer) return null;

  return createPortal(modalContent, targetContainer);
};
