import React from 'react';
import { Volume2, VolumeX, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundAlert } from '../../lib/soundAlert';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  isSoundMuted,
  onToggleSound,
}) => {
  const { user, signOut } = useAuth();

  return (
    <header className="h-20 border-b border-obsidian-border bg-obsidian/90 backdrop-blur-md px-6 md:px-10 flex items-center justify-between z-20">
      <div>
        <h1 className="font-serif text-xl md:text-2xl font-medium text-ivory tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-parchment/60 font-sans tracking-wide mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Audio Alert Toggle */}
        <button
          onClick={() => {
            soundAlert.unlockAudio();
            onToggleSound();
          }}
          className={`p-2.5 rounded border transition-colors flex items-center gap-2 text-xs font-medium ${
            isSoundMuted
              ? 'bg-obsidian-elevated text-parchment/50 border-obsidian-border hover:text-ivory'
              : 'bg-champagne/15 text-champagne border-champagne/40 hover:bg-champagne/25'
          }`}
          title={isSoundMuted ? 'Unmute Audio Warning System' : 'Mute Audio Warning System'}
        >
          {isSoundMuted ? (
            <VolumeX className="w-4 h-4 text-parchment/50" />
          ) : (
            <Volume2 className="w-4 h-4 text-champagne" />
          )}
          <span className="hidden sm:inline">
            {isSoundMuted ? 'Audio Muted' : 'Sound Alerts Active'}
          </span>
        </button>

        {/* User Identity Chip */}
        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-obsidian-border">
          <div className="w-8 h-8 rounded-full bg-emerald text-champagne border border-champagne/40 flex items-center justify-center font-serif text-sm font-semibold">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-ivory leading-tight">
              {user?.displayName || 'Alex Carter'}
            </span>
            <span className="text-[10px] text-parchment/50 font-mono">
              {user?.isDemoUser ? 'Demo Driver' : 'Authenticated Driver'}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut()}
          className="p-2 text-parchment/60 hover:text-red-400 hover:bg-obsidian-elevated rounded transition-colors"
          title="Sign Out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
