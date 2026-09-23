import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendUp = true,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
};
