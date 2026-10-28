import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'forest' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  icon,
  isLoading = false,
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
    forest: 'bg-forest hover:bg-forest-light text-ivory border border-gold/40 shadow-sm active:bg-forest-dark',
    gold: 'bg-gold hover:bg-gold-light text-forest-dark font-semibold border border-gold-dark shadow-sm active:bg-gold-dark',
    danger: 'bg-red-800 hover:bg-red-700 text-ivory border border-red-500 shadow-sm',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2.5 rounded font-sans font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
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
