import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  variant?: 'ivory' | 'charcoal' | 'outline' | 'glass';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  size = 'md',
  icon,
  variant = 'glass',
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-sm md:text-base font-medium',
  }[size];

  const variantStyles = {
    glass:
      'bg-obsidian/75 hover:bg-obsidian/95 backdrop-blur-md text-ivory border border-champagne/40 hover:border-champagne transition-all shadow-sm',
    ivory:
      'bg-parchment/60 hover:bg-parchment text-emerald-dark border border-champagne/30 hover:border-champagne/60',
    charcoal:
      'bg-obsidian-elevated hover:bg-obsidian-card text-ivory border border-champagne/25 hover:border-champagne/50',
    outline:
      'bg-transparent hover:bg-emerald/10 text-emerald-dark border border-emerald/30 hover:border-emerald',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded font-sans tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-champagne/40 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
