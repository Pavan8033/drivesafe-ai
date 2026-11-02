import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, User, Award } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { AcademicCharterModal } from '../common/AcademicCharterModal';
import { useAuth } from '../../context/AuthContext';

export const SiteNavigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCharterOpen, setIsCharterOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-obsidian/90 backdrop-blur-md border-b border-champagne/25 py-3 shadow-luxury-dark'
          : 'bg-obsidian/60 backdrop-blur-sm border-b border-champagne/15 py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Monogram */}
        <BrandLogo variant="dark" size="md" />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-sans tracking-wide">
          <a
            href="#home"
            className="text-ivory font-medium relative pb-1 transition-colors hover:text-champagne group"
          >
            <span>Home</span>
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-champagne rounded-full" />
          </a>
          <a
            href="#purpose"
            className="text-ivory/80 hover:text-champagne transition-colors font-medium"
          >
            Purpose
          </a>
          <a
            href="#capabilities"
            className="text-ivory/80 hover:text-champagne transition-colors font-medium"
          >
            Capabilities
          </a>
          <a
            href="#how-it-works"
            className="text-ivory/80 hover:text-champagne transition-colors font-medium"
          >
            How It Works
          </a>
          <a
            href="#technology"
            className="text-ivory/80 hover:text-champagne transition-colors font-medium"
          >
            Technology
          </a>
          <Link
            to="/app"
            className="text-ivory/80 hover:text-champagne transition-colors font-medium"
          >
            Dashboard
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => setIsCharterOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-champagne hover:text-champagne-light px-3 py-1.5 rounded-full border border-champagne/40 bg-emerald-950/40 hover:bg-emerald-950/70 transition-all shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Team 8</span>
          </button>

          <Link
            to={user ? '/app' : '/login'}
            className="inline-flex items-center gap-2 text-xs font-medium text-parchment/90 hover:text-champagne transition-colors px-3 py-1.5 rounded border border-champagne/30 hover:border-champagne/60 bg-obsidian/40 backdrop-blur-sm"
          >
            <User className="w-3.5 h-3.5 text-champagne" />
            <span>{user?.displayName || 'Lord Sterling'}</span>
          </Link>

          <button
            onClick={() => navigate('/app/monitor')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-champagne hover:bg-champagne-light active:bg-champagne-dark text-obsidian font-semibold text-xs tracking-wide transition-all shadow-sm hover:shadow-gold-glow"
          >
            <span>Start Monitoring</span>
            <ArrowRight className="w-3.5 h-3.5 text-obsidian" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="lg:hidden p-2 text-ivory hover:text-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-obsidian/95 backdrop-blur-xl border-b border-champagne/30 px-6 py-6 shadow-2xl animate-fade-in text-ivory">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ivory hover:text-champagne py-2 border-b border-obsidian-border"
            >
              Home
            </a>
            <a
              href="#purpose"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ivory hover:text-champagne py-2 border-b border-obsidian-border"
            >
              Purpose
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ivory hover:text-champagne py-2 border-b border-obsidian-border"
            >
              Capabilities
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ivory hover:text-champagne py-2 border-b border-obsidian-border"
            >
              How It Works
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ivory hover:text-champagne py-2 border-b border-obsidian-border"
            >
              Technology
            </a>
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ivory hover:text-champagne py-2 border-b border-obsidian-border"
            >
              Dashboard
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCharterOpen(true);
              }}
              className="w-full text-center py-2.5 rounded bg-emerald-950/70 text-champagne font-mono text-xs border border-champagne/40 flex items-center justify-center gap-2"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Team 8</span>
            </button>
            <div className="pt-4 flex flex-col gap-3">
              {user ? (
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-emerald/60 text-ivory font-medium border border-champagne/30"
                >
                  Enter Studio ({user.displayName || 'Driver'})
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-obsidian-elevated text-ivory font-medium border border-champagne/30"
                >
                  Sign In
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/app/monitor');
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded bg-champagne hover:bg-champagne-light text-obsidian font-semibold text-xs tracking-wide transition-all shadow-sm"
              >
                <span>Start Monitoring</span>
                <ArrowRight className="w-3.5 h-3.5 text-obsidian" />
              </button>
            </div>
          </nav>
        </div>
      )}
      {/* Academic Charter Modal */}
      <AcademicCharterModal
        isOpen={isCharterOpen}
        onClose={() => setIsCharterOpen(false)}
      />
    </header>
  );
};
