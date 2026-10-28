import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const { signInWithEmail, signInWithGoogle, loginAsDemoUser, resetPassword, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    setIsLoading(true);
    const res = await signInWithEmail(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    const res = await signInWithGoogle();
    setIsLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Google sign-in could not be completed.');
    }
  };

  const handleDemoSignIn = () => {
    loginAsDemoUser('Lord Sterling', 'sterling@drivesafe.luxury');
    navigate(from, { replace: true });
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const res = await resetPassword(forgotEmail);
    if (res.success) {
      setResetSent(true);
    } else {
      setError(res.error || 'Could not send password reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between py-12 px-6 md:px-12">
      {/* Brand Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <BrandLogo variant="light" size="md" />
        <Link
          to="/"
          className="text-xs font-sans tracking-wide text-ink-muted hover:text-forest transition-colors"
        >
          &larr; Return to Portal
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-parchment/40 p-8 md:p-10 rounded border border-gold/30 shadow-luxury">
        <div className="text-center mb-8">
          <span className="eyebrow text-forest text-[10px] tracking-widest block mb-2">
            TELEMETRY PORTAL
          </span>
          <h2 className="font-serif text-3xl font-medium text-ink tracking-tight">
            Sign In to Your Studio
          </h2>
          <p className="text-xs text-ink-muted mt-2 font-sans">
            Access your driver vigilance telemetry, camera controls, and session archives.
          </p>
        </div>

        {/* Firebase Environment Status Indicator */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 rounded bg-gold/10 border border-gold/40 text-xs text-forest-dark space-y-2">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-gold-dark shrink-0" />
              <span>Evaluation Mode Active</span>
            </div>
            <p className="text-[11px] leading-relaxed text-ink-muted">
              Cloud Firebase credentials are not yet configured in <code className="bg-gold/20 px-1 py-0.5 rounded font-mono text-[10px]">.env</code>. You may use Demo Mode below for immediate inspection of all features.
            </p>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full mt-2 py-2 px-3 rounded bg-forest text-ivory text-xs font-medium hover:bg-forest-light transition-colors text-center"
            >
              Sign In as Demo Operator &rarr;
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded bg-red-950/10 border border-red-500/40 text-xs text-red-800 leading-normal">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-xs font-medium text-forest-dark mb-1.5 font-sans">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@drivesafe.luxury"
                className="w-full px-4 py-2.5 pl-10 rounded bg-ivory border border-gold/30 text-ink text-sm font-sans focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors placeholder:text-ink-muted/50"
              />
              <Mail className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-forest-dark font-sans">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-gold hover:text-gold-dark font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full px-4 py-2.5 pl-10 pr-10 rounded bg-ivory border border-gold/30 text-ink text-sm font-sans focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors placeholder:text-ink-muted/50"
              />
              <Lock className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <PrimaryButton
            type="submit"
            size="md"
            variant="forest"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Authenticate & Open Studio
          </PrimaryButton>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gold/20" />
          </div>
          <span className="relative bg-parchment/60 px-3 text-[11px] text-ink-muted font-sans uppercase tracking-wider">
            Or Alternate Sign-In
          </span>
        </div>

        {/* Google Sign In */}
        <div className="space-y-3">
          <SecondaryButton
            type="button"
            size="md"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full text-xs"
          >
            Continue with Google
          </SecondaryButton>

          {isFirebaseConfigured && (
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2 text-center text-xs text-gold hover:text-forest transition-colors font-medium"
            >
              Quick Test as Demo Operator &rarr;
            </button>
          )}
        </div>

        {/* Link to Register */}
        <div className="mt-8 pt-6 border-t border-gold/20 text-center text-xs text-ink-muted">
          <span>New driver to the platform? </span>
          <Link
            to="/register"
            className="text-forest-dark font-semibold hover:text-gold transition-colors ml-1"
          >
            Register your vehicle &rarr;
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-gold/40 p-6 md:p-8 rounded max-w-sm w-full shadow-2xl">
            <h3 className="font-serif text-xl font-medium text-forest-dark mb-2">
              Password Reset
            </h3>
            {resetSent ? (
              <div className="space-y-4">
                <p className="text-xs text-ink-muted leading-relaxed">
                  A password reset dispatch has been transmitted to {forgotEmail}. Please inspect your inbox.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 bg-forest text-ivory text-xs font-medium rounded"
                >
                  Close Notice
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-ink-muted leading-relaxed">
                  Enter your registered email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="driver@drivesafe.luxury"
                  className="w-full px-3 py-2 rounded bg-parchment/40 border border-gold/30 text-xs text-ink focus:outline-none focus:border-forest"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 border border-gold/30 text-xs rounded text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-forest text-ivory text-xs font-medium rounded hover:bg-forest-light"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="text-center text-xs text-ink-muted font-sans max-w-md mx-auto">
        &copy; {new Date().getFullYear()} DriveSafe AI. Secure authentication for driver vigilance research.
      </div>
    </div>
  );
};
