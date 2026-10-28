import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, User } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { PrimaryButton } from '../common/PrimaryButton';
import { useAuth } from '../../context/AuthContext';

export const SiteNavigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-ivory/95 backdrop-blur-md border-b border-gold/20 shadow-sm py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Monogram */}
        <BrandLogo variant="light" size="md" />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-sans tracking-wide">
          <a
            href="#purpose"
            className="text-ink/80 hover:text-forest transition-colors font-medium"
          >
            Purpose
          </a>
          <a
            href="#features"
            className="text-ink/80 hover:text-forest transition-colors font-medium"
          >
            Capabilities
          </a>
          <a
            href="#how-it-works"
            className="text-ink/80 hover:text-forest transition-colors font-medium"
          >
            How It Works
          </a>
          <a
            href="#technology"
            className="text-ink/80 hover:text-forest transition-colors font-medium"
          >
            Technology
          </a>
          <a
            href="#safety"
            className="text-ink/80 hover:text-forest transition-colors font-medium"
          >
            Safety Principles
          </a>
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-2 text-sm font-medium text-forest-dark hover:text-gold transition-colors px-3 py-2"
            >
              <User className="w-4 h-4 text-gold" />
              <span>{user.displayName || 'Studio'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-forest-dark hover:text-gold transition-colors px-3 py-2"
            >
              Sign In
            </Link>
          )}

          <PrimaryButton
            size="sm"
            variant="forest"
            onClick={() => navigate('/app/monitor')}
            icon={<ArrowRight className="w-3.5 h-3.5 text-gold" />}
          >
            Start Monitoring
          </PrimaryButton>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="lg:hidden p-2 text-forest-dark hover:text-gold focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-ivory border-b border-gold/30 px-6 py-6 shadow-xl animate-fade-in">
          <nav className="flex flex-col gap-4 text-base font-medium">
            <a
              href="#purpose"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ink hover:text-forest py-1 border-b border-parchment"
            >
              Purpose
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ink hover:text-forest py-1 border-b border-parchment"
            >
              Capabilities
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ink hover:text-forest py-1 border-b border-parchment"
            >
              How It Works
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ink hover:text-forest py-1 border-b border-parchment"
            >
              Technology
            </a>
            <a
              href="#safety"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ink hover:text-forest py-1 border-b border-parchment"
            >
              Safety Principles
            </a>
            <div className="pt-4 flex flex-col gap-3">
              {user ? (
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-parchment text-forest-dark font-medium border border-gold/30"
                >
                  Enter Studio ({user.displayName || 'Driver'})
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-parchment text-forest-dark font-medium border border-gold/30"
                >
                  Sign In
                </Link>
              )}
              <PrimaryButton
                size="md"
                variant="forest"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/app/monitor');
                }}
              >
                Launch Monitoring Studio
              </PrimaryButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
