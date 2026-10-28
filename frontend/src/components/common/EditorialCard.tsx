import React from 'react';

interface EditorialCardProps {
  number?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  tag?: string;
  variant?: 'ivory' | 'dark' | 'forest';
  className?: string;
}

export const EditorialCard: React.FC<EditorialCardProps> = ({
  number,
  title,
  description,
  icon,
  tag,
  variant = 'ivory',
  className = '',
}) => {
  const styles = {
    ivory: 'bg-ivory/80 text-ink border border-gold/25 hover:border-gold/60 shadow-sm',
    dark: 'bg-charcoal-card text-ivory border border-gold/20 hover:border-gold/50 shadow-luxury-dark',
    forest: 'bg-forest/90 text-ivory border border-gold/30 hover:border-gold/70 shadow-luxury',
  }[variant];

  return (
    <div
      className={`relative p-8 rounded transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between ${styles} ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          {number && (
            <span className="font-serif italic text-2xl text-gold font-normal">
              {number}
            </span>
          )}
          {icon && (
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold/10 text-gold border border-gold/30">
              {icon}
            </div>
          )}
        </div>

        {tag && (
          <span className="eyebrow text-gold-muted text-[10px] tracking-widest block mb-2">
            {tag}
          </span>
        )}

        <h3 className="font-serif text-xl md:text-2xl font-medium tracking-tight mb-3">
          {title}
        </h3>

        <p className="text-sm md:text-base leading-relaxed opacity-80 font-normal">
          {description}
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-gold/15 flex items-center text-xs tracking-wider text-gold uppercase font-medium">
        <span>Architectural Precision</span>
      </div>
    </div>
  );
};
