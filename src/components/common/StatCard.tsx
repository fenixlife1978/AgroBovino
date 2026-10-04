import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  icon: LucideIcon;
  color?: 'emerald' | 'sky' | 'amber' | 'rose' | 'purple' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'emerald',
  onClick
}) => {
  const colorStyles = {
    emerald: {
      border: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      glow: 'hover:shadow-emerald-500/5'
    },
    sky: {
      border: 'hover:border-sky-400',
      iconBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      glow: 'hover:shadow-sky-500/5'
    },
    amber: {
      border: 'hover:border-amber-400',
      iconBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      glow: 'hover:shadow-amber-500/5'
    },
    rose: {
      border: 'hover:border-rose-400',
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      glow: 'hover:shadow-rose-500/5'
    },
    purple: {
      border: 'hover:border-purple-400',
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      glow: 'hover:shadow-purple-500/5'
    },
    indigo: {
      border: 'hover:border-indigo-400',
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      glow: 'hover:shadow-indigo-500/5'
    }
  };

  const currentStyle = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-md ${currentStyle.glow} ${currentStyle.border} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {value}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              {trend.label && (
                <span className="text-[11px] text-slate-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl border ${currentStyle.iconBg} transition-transform group-hover:scale-105 shadow-2xs`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
