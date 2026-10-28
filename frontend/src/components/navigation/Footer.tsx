import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Terminal } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-ivory border-t border-gold/25 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-gold/15">
          {/* Column 1: Brand & Heritage */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo variant="dark" size="lg" />
            <p className="text-sm text-parchment/70 max-w-md leading-relaxed mt-4">
              DriveSafe AI harmonizes vintage motoring heritage with contemporary computer vision.
              Engineered to detect driver drowsiness and fatigue indicators with mathematical rigor
              and privacy-conscious local processing.
            </p>
            <div className="flex items-center gap-6 pt-2 text-xs text-gold font-mono">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-gold" /> Vigilant Telemetry
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gold" /> Zero Cloud Video Storage
              </span>
            </div>
          </div>

          {/* Column 2: Studio Navigation */}
          <div>
            <h4 className="eyebrow text-gold tracking-widest text-xs mb-4">
              The Studio
            </h4>
            <ul className="space-y-2.5 text-sm text-parchment/80">
              <li>
                <Link to="/app/monitor" className="hover:text-gold transition-colors">
                  Live Monitoring Studio
                </Link>
              </li>
              <li>
                <Link to="/app" className="hover:text-gold transition-colors">
                  Telemetry Overview
                </Link>
              </li>
              <li>
                <Link to="/app/history" className="hover:text-gold transition-colors">
                  Session Log & Archives
                </Link>
              </li>
              <li>
                <Link to="/app/insights" className="hover:text-gold transition-colors">
                  Fatigue Trend Analytics
                </Link>
              </li>
              <li>
                <Link to="/app/settings" className="hover:text-gold transition-colors">
                  Sensor Sensitivity
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Architecture & Security */}
          <div>
            <h4 className="eyebrow text-gold tracking-widest text-xs mb-4">
              Architecture
            </h4>
            <ul className="space-y-2.5 text-sm text-parchment/80">
              <li className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-gold/70" />
                <span>FastAPI & MediaPipe</span>
              </li>
              <li className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-gold/70" />
                <span>6-Point Eye Aspect Ratio</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-gold/70" />
                <span>Firebase Authentication</span>
              </li>
              <li>
                <span className="text-xs text-parchment/50">WebSocket Telemetry Protocol</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Safety Disclaimer and Legal Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-parchment/60">
          <p className="max-w-2xl text-center md:text-left leading-normal">
            <strong className="text-gold font-medium">Important Advisory:</strong> DriveSafe AI is an assistive technology prototype designed for driver awareness and vigilance research. It does not replace required physical rest breaks, sufficient sleep, or safe driving judgment. Never operate a motor vehicle when impaired by fatigue.
          </p>
          <div className="shrink-0 text-center md:text-right font-mono text-[11px] text-parchment/40">
            &copy; {currentYear} DriveSafe AI Motoring Heritage. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
