import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  glowColor?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  interactive = false,
  glowColor,
  padding = 'md',
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  }[padding];

  const baseStyle: React.CSSProperties = glowColor
    ? {
        boxShadow: interactive
          ? undefined
          : `0 8px 32px 0 ${glowColor}15, inset 0 1px 0 0 rgba(255, 255, 255, 0.25)`,
      }
    : {};

  return (
    <div
      onClick={onClick}
      style={baseStyle}
      className={`
        relative rounded-3xl overflow-hidden
        border border-white/60 dark:border-white/10
        ${interactive ? 'glass-panel-interactive cursor-pointer' : 'glass-panel'}
        ${paddingClasses}
        ${className}
      `}
      {...props}
    >
      {/* Specular glass reflection line on top border */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/15 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
