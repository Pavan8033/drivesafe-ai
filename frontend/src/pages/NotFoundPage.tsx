import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

const CURRENT_YEAR = new Date().getFullYear();

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory text-ink flex flex-col justify-between p-8 md:p-16">
      <div className="max-w-7xl mx-auto w-full">
        <BrandLogo variant="light" size="md" />
      </div>

      <div className="max-w-md mx-auto text-center space-y-6 my-auto">
        <div className="w-16 h-16 rounded-full bg-parchment text-forest-dark border border-gold/40 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 text-gold" />
        </div>

        <span className="eyebrow text-forest text-xs tracking-widest block">
          OFF-ROUTE NOTIFICATION
        </span>

        <h1 className="font-serif text-5xl font-medium text-ink">
          404
        </h1>

        <p className="text-sm text-ink-muted leading-relaxed font-sans">
          The requested coordinate or telemetry sector does not exist on the current motoring chart.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-forest text-ivory text-xs font-medium hover:bg-forest-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gold" />
            <span>Return to Landing Portal</span>
          </Link>

          <Link
            to="/app"
            className="px-6 py-2.5 rounded border border-gold/40 text-forest-dark text-xs font-medium hover:bg-parchment/60 transition-colors"
          >
            Open Monitoring Studio
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-ink-muted font-mono">
        &copy; {CURRENT_YEAR} DriveSafe AI Telemetry
      </div>
    </div>
  );
};
