import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  variant?: 'ivory' | 'charcoal' | 'outline';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  size = 'md',
  icon,
  variant = 'ivory',
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }[size];

  const variantStyles = {
    ivory: 'bg-parchment/60 hover:bg-parchment text-forest-dark border border-gold/30 hover:border-gold/60',
    charcoal: 'bg-charcoal-elevated hover:bg-charcoal-card text-ivory border border-gold/25 hover:border-gold/50',
    outline: 'bg-transparent hover:bg-gold/10 text-forest-dark border border-forest/30 hover:border-forest',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded font-sans font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
