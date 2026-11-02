import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    signUpWithEmail,
    signInWithGoogle,
    loginAsDemoUser,
    isFirebaseConfigured,
  } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full driver name.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Email and password fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    setIsLoading(true);
    const res = await signUpWithEmail(name.trim(), email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      navigate('/app', { replace: true });
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    const res = await signInWithGoogle();
    setIsLoading(false);

    if (res.success) {
      navigate('/app', { replace: true });
    } else {
      setError(res.error || 'Google sign-up could not be completed.');
    }
  };

  const handleDemoSignIn = () => {
    loginAsDemoUser(name || 'Alex Carter', email || 'driver@drivesafe.ai');
    navigate('/app', { replace: true });
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

      {/* Main Registration Card Matching Reference Image */}
      <div className="max-w-md w-full mx-auto my-8 bg-obsidian-card/90 backdrop-blur-xl p-8 md:p-10 rounded border border-champagne/30 shadow-luxury-dark relative z-10 space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-emerald/60 text-champagne border border-champagne/30 flex items-center justify-center mx-auto mb-3">
            <User className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-3xl font-medium text-ivory tracking-tight">
            Register Account
          </h2>
          <p className="text-xs text-parchment/70 mt-1 font-sans">
            Create your account &mdash; join DriveSafe AI for safer journeys.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-950/80 border border-red-500 text-xs text-red-300 font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-parchment/80 font-sans">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-champagne/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Carter"
                required
                className="w-full bg-obsidian-elevated border border-champagne/25 rounded pl-10 pr-3.5 py-2.5 text-xs text-ivory placeholder-parchment/30 focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

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
                placeholder="Minimum 6 characters"
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-parchment/80 font-sans">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-champagne/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full bg-obsidian-elevated border border-champagne/25 rounded pl-10 pr-3.5 py-2.5 text-xs text-ivory placeholder-parchment/30 focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded bg-champagne hover:bg-champagne-light active:bg-champagne-dark text-obsidian font-semibold text-xs tracking-wide transition-all shadow-sm hover:shadow-gold-glow flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Create Account</span>
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

        {/* Sign In Link */}
        <div className="text-center text-xs text-parchment/60 font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-champagne font-semibold hover:underline">
            Sign In &rarr;
          </Link>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="text-center text-[11px] text-parchment/40 font-mono relative z-10">
        &copy; {new Date().getFullYear()} DriveSafe AI &bull; Vigilance &amp; Heritage
      </div>
    </div>
  );
};
