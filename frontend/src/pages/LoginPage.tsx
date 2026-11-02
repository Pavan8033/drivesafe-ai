import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const {
    signInWithEmail,
    signInWithGoogle,
    loginAsDemoUser,
    resetPassword,
    isFirebaseConfigured,
  } = useAuth();
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
    loginAsDemoUser('Alex Carter', 'driver@drivesafe.ai');
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
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col justify-between py-10 px-6 md:px-12 relative overflow-hidden">
      {/* Background Motoring Ambient Lighting */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/coastal_sunset_tourer.jpg"
          alt="Atmospheric motoring backdrop"
          className="w-full h-full object-cover object-center filter brightness-[0.22] contrast-[1.1] blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/85 to-obsidian/70" />
      </div>

      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <BrandLogo variant="dark" size="md" />
        <Link
          to="/"
          className="text-xs font-sans tracking-wide text-parchment/70 hover:text-champagne transition-colors"
        >
          &larr; Return to Portal
        </Link>
      </div>

      {/* Main Authentication Card Matching Reference Image */}
      <div className="max-w-md w-full mx-auto my-8 bg-obsidian-card/90 backdrop-blur-xl p-8 md:p-10 rounded border border-champagne/30 shadow-luxury-dark relative z-10 space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-emerald/60 text-champagne border border-champagne/30 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-3xl font-medium text-ivory tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-parchment/70 mt-1 font-sans">
            Sign in to continue your safer journeys.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-950/80 border border-red-500 text-xs text-red-300 font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-parchment/80 font-sans">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-champagne/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@drivesafe.ai"
                required
                className="w-full bg-obsidian-elevated border border-champagne/25 rounded pl-10 pr-3.5 py-2.5 text-xs text-ivory placeholder-parchment/30 focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-parchment/80 font-sans">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-champagne/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                required
                className="w-full bg-obsidian-elevated border border-champagne/25 rounded pl-10 pr-10 py-2.5 text-xs text-ivory placeholder-parchment/30 focus:outline-none focus:border-champagne"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-parchment/50 hover:text-champagne absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs font-sans pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-parchment/70">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#C4A66A] rounded"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-champagne hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded bg-champagne hover:bg-champagne-light active:bg-champagne-dark text-obsidian font-semibold text-xs tracking-wide transition-all shadow-sm hover:shadow-gold-glow flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-parchment/40">
          <div className="flex-1 h-px bg-champagne/20" />
          <span>or</span>
          <div className="flex-1 h-px bg-champagne/20" />
        </div>

        {/* Google Sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 rounded bg-obsidian-elevated hover:bg-obsidian border border-champagne/25 text-ivory text-xs font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Demo Mode Button (Delineated & Distinct) */}
        <div className="pt-2 border-t border-obsidian-border text-center space-y-2">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2 rounded bg-emerald/30 hover:bg-emerald/50 border border-emerald/50 text-champagne text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Continue in Demo Mode (Alex Carter)</span>
          </button>
        </div>

        {/* Registration Link */}
        <div className="text-center text-xs text-parchment/60 font-sans">
          Don't have an account?{' '}
          <Link to="/register" className="text-champagne font-semibold hover:underline">
            Register here &rarr;
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-obsidian-card border border-champagne/30 rounded p-6 shadow-luxury-dark space-y-4">
            <h3 className="font-serif text-lg font-medium text-ivory">
              Reset Password
            </h3>
            {resetSent ? (
              <p className="text-xs text-emerald-300 font-sans">
                Password reset link sent! Check your inbox.
              </p>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full bg-obsidian-elevated border border-champagne/30 rounded px-3 py-2 text-xs text-ivory"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded bg-champagne text-obsidian text-xs font-semibold"
                >
                  Send Reset Link
                </button>
              </form>
            )}
            <button
              onClick={() => {
                setShowForgotModal(false);
                setResetSent(false);
              }}
              className="w-full text-xs text-parchment/60 hover:text-ivory"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer Notice */}
      <div className="text-center text-[11px] text-parchment/40 font-mono relative z-10">
        &copy; {new Date().getFullYear()} DriveSafe AI &bull; Vigilance &amp; Heritage
      </div>
    </div>
  );
};
