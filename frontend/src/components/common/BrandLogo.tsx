import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  size = 'md',
  to = '/',
  className = '',
}) => {
  const isDark = variant === 'dark';

  const sizeClasses = {
    sm: { crest: 'w-7 h-7', title: 'text-base', sub: 'text-[9px]' },
    md: { crest: 'w-9 h-9', title: 'text-xl', sub: 'text-[10px]' },
    lg: { crest: 'w-12 h-12', title: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-3 group transition-opacity hover:opacity-90 ${className}`}
      aria-label="DriveSafe AI Home"
    >
      <div className={`relative flex items-center justify-center ${sizeClasses.crest} shrink-0`}>
        {/* Heritage Automotive Shield Crest */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield Base */}
          <path
            d="M50 8 L88 22 V52 C88 74 50 92 50 92 C50 92 12 74 12 52 V22 Z"
            fill={isDark ? '#173F2A' : '#173F2A'}
            stroke="#B89A5A"
            strokeWidth="3"
          />
          {/* Inner Accent Line */}
          <path
            d="M50 15 L82 27 V50 C82 68 50 84 50 84 C50 84 18 68 18 50 V27 Z"
            stroke="#B89A5A"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.7"
          />
          {/* Stylized Eye & Horizon */}
          <circle cx="50" cy="46" r="16" stroke="#B89A5A" strokeWidth="1.5" />
          <path
            d="M39 46 C42 41 58 41 61 46 C58 51 42 51 39 46 Z"
            stroke="#F7F3E8"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="50" cy="46" r="3.5" fill="#B89A5A" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif tracking-tight leading-none font-semibold ${sizeClasses.title} ${
            isDark ? 'text-ivory' : 'text-forest-dark'
          }`}
        >
          DriveSafe <span className="text-gold italic font-normal">AI</span>
        </span>
        <span
          className={`eyebrow font-medium tracking-widest mt-0.5 ${sizeClasses.sub} ${
            isDark ? 'text-parchment/60' : 'text-ink-muted'
          }`}
        >
          Vigilance &bull; Heritage
        </span>
      </div>
    </Link>
  );
};
