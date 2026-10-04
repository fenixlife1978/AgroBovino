import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 
    | 'default' 
    | 'success' 
    | 'warning' 
    | 'danger' 
    | 'info' 
    | 'purple' 
    | 'cyan' 
    | 'amber' 
    | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold tracking-tight',
    sm: 'px-2.5 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-sm font-semibold'
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    cyan: 'bg-teal-50 text-teal-700 border border-teal-200/80',
    amber: 'bg-orange-50 text-orange-800 border border-orange-200/80',
    outline: 'bg-white text-slate-600 border border-slate-300 shadow-2xs'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
