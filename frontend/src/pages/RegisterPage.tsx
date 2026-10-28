import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signUpWithEmail, signInWithGoogle, loginAsDemoUser, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full driver or operator name.');
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
    loginAsDemoUser(name || 'Lord Sterling', email || 'sterling@drivesafe.luxury');
    navigate('/app', { replace: true });
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

      {/* Main Registration Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-parchment/40 p-8 md:p-10 rounded border border-gold/30 shadow-luxury">
        <div className="text-center mb-8">
          <span className="eyebrow text-forest text-[10px] tracking-widest block mb-2">
            OPERATOR REGISTRY
          </span>
          <h2 className="font-serif text-3xl font-medium text-ink tracking-tight">
            Register Driver Profile
          </h2>
          <p className="text-xs text-ink-muted mt-2 font-sans">
            Enroll your credentials to maintain continuous fatigue surveillance logs.
          </p>
        </div>

        {/* Firebase Config Notice */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 rounded bg-gold/10 border border-gold/40 text-xs text-forest-dark space-y-2">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-gold-dark shrink-0" />
              <span>Evaluation Mode Active</span>
            </div>
            <p className="text-[11px] leading-relaxed text-ink-muted">
              You may test the application immediately as a demo operator without needing a Firebase project configured.
            </p>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full mt-2 py-2 px-3 rounded bg-forest text-ivory text-xs font-medium hover:bg-forest-light transition-colors text-center"
            >
              Sign Up in Demo Mode &rarr;
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded bg-red-950/10 border border-red-500/40 text-xs text-red-800 leading-normal">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Driver Name input */}
          <div>
            <label className="block text-xs font-medium text-forest-dark mb-1 font-sans">
              Driver Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lord Sterling"
                className="w-full px-4 py-2.5 pl-10 rounded bg-ivory border border-gold/30 text-ink text-sm font-sans focus:outline-none focus:border-forest"
              />
              <User className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-xs font-medium text-forest-dark mb-1 font-sans">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@drivesafe.luxury"
                className="w-full px-4 py-2.5 pl-10 rounded bg-ivory border border-gold/30 text-ink text-sm font-sans focus:outline-none focus:border-forest"
              />
              <Mail className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-medium text-forest-dark mb-1 font-sans">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full px-4 py-2.5 pl-10 pr-10 rounded bg-ivory border border-gold/30 text-ink text-sm font-sans focus:outline-none focus:border-forest"
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

          {/* Confirm Password input */}
          <div>
            <label className="block text-xs font-medium text-forest-dark mb-1 font-sans">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full px-4 py-2.5 pl-10 rounded bg-ivory border border-gold/30 text-ink text-sm font-sans focus:outline-none focus:border-forest"
              />
              <Lock className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
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
            Create Profile & Enter Studio
          </PrimaryButton>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gold/20" />
          </div>
          <span className="relative bg-parchment/60 px-3 text-[11px] text-ink-muted font-sans uppercase tracking-wider">
            Or Alternate Registration
          </span>
        </div>

        {/* Google Sign In */}
        <SecondaryButton
          type="button"
          size="md"
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full text-xs"
        >
          Sign Up with Google
        </SecondaryButton>

        {/* Link to Login */}
        <div className="mt-8 pt-6 border-t border-gold/20 text-center text-xs text-ink-muted">
          <span>Already registered with DriveSafe AI? </span>
          <Link
            to="/login"
            className="text-forest-dark font-semibold hover:text-gold transition-colors ml-1"
          >
            Sign in here &rarr;
          </Link>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-xs text-ink-muted font-sans max-w-md mx-auto">
        &copy; {new Date().getFullYear()} DriveSafe AI. Secure authentication for driver vigilance research.
      </div>
    </div>
  );
};
