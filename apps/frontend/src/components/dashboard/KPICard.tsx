import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'brand' | 'purple' | 'emerald' | 'amber';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'brand'
}) => {
  const colorMap = {
    brand: 'from-brand-500/20 to-brand-600/5 text-brand-500 border-brand-500/30',
    purple: 'from-accent-purple/20 to-accent-purple/5 text-accent-purple border-accent-purple/30',
    emerald: 'from-accent-emerald/20 to-accent-emerald/5 text-accent-emerald border-accent-emerald/30',
    amber: 'from-accent-amber/20 to-accent-amber/5 text-accent-amber border-accent-amber/30'
  };

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
        {change && (
          <div className="flex items-center gap-1 mt-2 text-xs font-medium">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>{change}</span>
            <span className="text-slate-500 ml-1">vs. período anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};
