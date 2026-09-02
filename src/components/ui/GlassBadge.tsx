import React from 'react';

interface GlassBadgeProps {
  children: React.ReactNode;
  color?: string; // hex or tailwind name
  variant?: 'solid' | 'subtle' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  color,
  variant = 'subtle',
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }[size];

  const dynamicStyle: React.CSSProperties = color
    ? {
        backgroundColor: variant === 'solid' ? color : `${color}18`,
        color: variant === 'solid' ? '#ffffff' : color,
        borderColor: variant === 'outline' ? color : `${color}35`,
      }
    : {};

  return (
    <span
      style={dynamicStyle}
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-xl border
        transition-all duration-200
        ${!color ? 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-white/10' : ''}
        ${sizeClasses}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
