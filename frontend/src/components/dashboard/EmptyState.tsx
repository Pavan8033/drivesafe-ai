import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`p-12 text-center rounded border border-dashed border-gold/25 bg-charcoal-card/50 max-w-lg mx-auto my-8 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mx-auto mb-4">
        {icon || <ShieldAlert className="w-7 h-7" />}
      </div>

      <h3 className="font-serif text-xl font-medium text-ivory mb-2">
        {title}
      </h3>

      <p className="text-sm text-parchment/60 leading-relaxed mb-6 font-sans">
        {description}
      </p>

      {actionText && onAction && (
        <PrimaryButton size="sm" variant="forest" onClick={onAction}>
          {actionText}
        </PrimaryButton>
      )}
    </div>
  );
};
