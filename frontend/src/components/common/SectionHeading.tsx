import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  variant?: 'light' | 'dark';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  variant = 'light',
  className = '',
}) => {
  const isDark = variant === 'dark';
  const textAlign = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl mb-12 ${textAlign} ${className}`}>
      {eyebrow && (
        <span
          className={`eyebrow inline-block mb-3.5 px-3 py-1 rounded border ${
            isDark
              ? 'text-gold-light border-gold/30 bg-gold/5'
              : 'text-forest border-gold/40 bg-gold/10'
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-4 ${
          isDark ? 'text-ivory' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-base md:text-lg leading-relaxed ${
            isDark ? 'text-parchment/70' : 'text-ink-muted'
          }`}
        >
          {description}
        </p>
      )}
      {/* Decorative fine rule */}
      <div
        className={`w-16 h-px mt-6 bg-gold/40 ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      />
    </div>
  );
};
