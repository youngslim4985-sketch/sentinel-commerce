import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  subValue: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, subValue }) => (
  <div className="bg-white/5 border border-white/10 p-5 rounded-xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      {trend === 'up' ? <TrendingUp className="w-12 h-12" /> : trend === 'down' ? <TrendingDown className="w-12 h-12" /> : <Activity className="w-12 h-12" />}
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">{label}</p>
    <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold tracking-tighter">{value}</h3>
      {trend !== 'neutral' && (
        <span className={cn("text-[10px] font-bold mb-1", trend === 'up' ? "text-emerald-500" : "text-red-500")}>
          {trend === 'up' ? '▲' : '▼'}
        </span>
      )}
    </div>
    <p className="text-[9px] text-white/20 uppercase tracking-widest mt-2">{subValue}</p>
  </div>
);
