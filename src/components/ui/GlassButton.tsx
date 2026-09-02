import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-2xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5'
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30 hover:scale-[1.01] active:scale-[0.98]',
    secondary:
      'bg-white/60 dark:bg-slate-800/60 hover:bg-white/85 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-white/10 shadow-sm hover:scale-[1.01] active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
    danger:
      'bg-rose-500/15 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/30 active:scale-[0.98]'
  }[variant];

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:pointer-events-none disabled:scale-100
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
