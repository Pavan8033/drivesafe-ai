import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'champagne' | 'gold' | 'forest' | 'emerald' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  variant = 'champagne',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-sm md:text-base font-semibold',
  }[size];

  const variantStyles = {
    champagne:
      'bg-champagne hover:bg-champagne-light active:bg-champagne-dark text-obsidian font-semibold border border-champagne-dark shadow-sm hover:shadow-gold-glow',
    gold:
      'bg-champagne hover:bg-champagne-light active:bg-champagne-dark text-obsidian font-semibold border border-champagne-dark shadow-sm hover:shadow-gold-glow',
    forest:
      'bg-emerald hover:bg-heritage active:bg-emerald-dark text-ivory font-medium border border-champagne/40 shadow-sm hover:border-champagne/70',
    emerald:
      'bg-emerald hover:bg-heritage active:bg-emerald-dark text-ivory font-medium border border-champagne/40 shadow-sm hover:border-champagne/70',
    danger:
      'bg-red-800 hover:bg-red-700 active:bg-red-900 text-ivory font-medium border border-red-500 shadow-sm',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2.5 rounded font-sans tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-champagne/50 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
