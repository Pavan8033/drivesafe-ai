import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Terminal, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-obsidian text-ivory border-t border-champagne/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-champagne/15">
          {/* Column 1: Brand & Heritage (Col 4) */}
          <div className="md:col-span-4 space-y-4">
            <BrandLogo variant="dark" size="md" />
            <p className="text-xs sm:text-sm text-parchment/70 max-w-sm leading-relaxed mt-4 font-sans">
              Intelligent driver monitoring that harmonizes vintage motoring heritage with contemporary computer vision &mdash; for a safer, more aware tomorrow.
            </p>
            {/* Social Icons (SVGs) */}
            <div className="flex items-center gap-3 pt-2 text-parchment/60">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-obsidian-elevated border border-champagne/25 flex items-center justify-center hover:text-champagne hover:border-champagne transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-obsidian-elevated border border-champagne/25 flex items-center justify-center hover:text-champagne hover:border-champagne transition-colors"
                aria-label="Twitter / X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-obsidian-elevated border border-champagne/25 flex items-center justify-center hover:text-champagne hover:border-champagne transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Product (Col 2) */}
          <div className="md:col-span-2">
            <h4 className="eyebrow text-champagne text-[10px] tracking-widest mb-4">
              PRODUCT
            </h4>
            <ul className="space-y-2.5 text-xs text-parchment/80 font-sans">
              <li>
                <Link to="/app" className="hover:text-champagne transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/app/monitor" className="hover:text-champagne transition-colors">
                  Monitoring
                </Link>
              </li>
              <li>
                <Link to="/app/history" className="hover:text-champagne transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link to="/app/insights" className="hover:text-champagne transition-colors">
                  Insights
                </Link>
              </li>
              <li>
                <Link to="/app/settings" className="hover:text-champagne transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company (Col 2) */}
          <div className="md:col-span-2">
            <h4 className="eyebrow text-champagne text-[10px] tracking-widest mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2.5 text-xs text-parchment/80 font-sans">
              <li>
                <a href="#purpose" className="hover:text-champagne transition-colors">
                  Purpose
                </a>
              </li>
              <li>
                <a href="#technology" className="hover:text-champagne transition-colors">
                  Technology
                </a>
              </li>
              <li>
                <a href="#safety" className="hover:text-champagne transition-colors">
                  Safety Principles
                </a>
              </li>
              <li>
                <a href="#safety" className="hover:text-champagne transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-champagne transition-colors">
                  Operator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription (Col 4) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="eyebrow text-champagne text-[10px] tracking-widest mb-2">
              STAY UPDATED
            </h4>
            <p className="text-xs text-parchment/70 font-sans leading-relaxed">
              Get the latest updates on DriveSafe AI and road vigilance telemetry.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 bg-obsidian-elevated border border-champagne/30 rounded px-3.5 py-2 text-xs text-ivory placeholder-parchment/40 focus:outline-none focus:border-champagne"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-champagne hover:bg-champagne-light text-obsidian text-xs font-semibold tracking-wide transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5 text-obsidian" />
              </button>
            </form>

            {subscribed && (
              <span className="text-[11px] text-emerald-400 font-mono block">
                &check; Subscribed to DriveSafe AI updates.
              </span>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Disclaimers */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-parchment/50 font-sans">
          <div>
            &copy; {currentYear} DriveSafe AI &bull; Kalasalingam Academy of Research and Education &bull; Dept. of Mechanical Engineering &bull; Team 8 (Design Build)
          </div>

          <div className="flex items-center gap-6">
            <a href="#safety" className="hover:text-champagne transition-colors">
              Privacy Policy
            </a>
            <a href="#safety" className="hover:text-champagne transition-colors">
              Terms of Service
            </a>
            <a href="#safety" className="hover:text-champagne transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
