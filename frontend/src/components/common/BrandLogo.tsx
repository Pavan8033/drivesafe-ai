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
    sm: { crest: 'w-7 h-7', title: 'text-base', sub: 'text-[8.5px]' },
    md: { crest: 'w-9 h-9', title: 'text-xl', sub: 'text-[9.5px]' },
    lg: { crest: 'w-11 h-11', title: 'text-2xl', sub: 'text-[11px]' },
  }[size];

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-3 group transition-opacity hover:opacity-95 ${className}`}
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
            fill="#173F2A"
            stroke="#C4A66A"
            strokeWidth="3"
          />
          {/* Inner Accent Line */}
          <path
            d="M50 15 L82 27 V50 C82 68 50 84 50 84 C50 84 18 68 18 50 V27 Z"
            stroke="#C4A66A"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.75"
          />
          {/* Center Emblem: Eye & Horizon */}
          <circle cx="50" cy="46" r="16" stroke="#C4A66A" strokeWidth="1.5" />
          <path
            d="M39 46 C42 41 58 41 61 46 C58 51 42 51 39 46 Z"
            stroke="#F7F3E8"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="50" cy="46" r="3.5" fill="#C4A66A" />
          <polygon
            points="50,22 52,27 57,27 53,30 55,35 50,32 45,35 47,30 43,27 48,27"
            fill="#C4A66A"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif tracking-tight leading-none font-semibold ${sizeClasses.title} ${
            isDark ? 'text-ivory' : 'text-obsidian'
          }`}
        >
          DriveSafe <span className="text-champagne italic font-normal">AI</span>
        </span>
        <span
          className={`eyebrow font-medium tracking-[0.2em] mt-0.5 ${sizeClasses.sub} ${
            isDark ? 'text-parchment/70' : 'text-secondary-text'
          }`}
        >
          VIGILANCE &bull; HERITAGE
        </span>
      </div>
    </Link>
  );
};
