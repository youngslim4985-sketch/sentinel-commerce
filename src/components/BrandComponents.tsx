import React from 'react';
import { Brand } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BrandCard: React.FC<{ brand: Brand }> = ({ brand }) => {
  return (
    <div className="bg-black/40 border border-white/5 p-3 rounded-lg hover:border-emerald-500/30 transition-all group cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">{brand.id}</span>
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          brand.status === 'INCUBATING' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        )} />
      </div>
      <h4 className="text-[11px] font-bold uppercase mb-3 truncate group-hover:text-emerald-500 transition-colors">{brand.name}</h4>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px]">
          <span className="text-white/20 uppercase">Profit</span>
          <span className={brand.profit >= 0 ? "text-emerald-400" : "text-red-400"}>${brand.profit.toLocaleString()}</span>
        </div>
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-1000" 
            style={{ width: `${brand.velocity * 100}%` }} 
          />
        </div>
        <div className="flex justify-between text-[8px] opacity-40 uppercase">
          <span>Velocity</span>
          <span>{Math.round(brand.velocity * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export const BrandRow: React.FC<{ brand: Brand }> = ({ brand }) => {
  return (
    <div className="grid grid-cols-6 items-center p-3 bg-black/40 border border-white/5 rounded-lg hover:bg-white/[0.02] transition-colors text-[10px] font-bold uppercase tracking-tight">
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", brand.status === 'INCUBATING' ? "bg-blue-500" : "bg-emerald-500")} />
        <span className="text-white/40">{brand.id}</span>
      </div>
      <div className="text-white/80">{brand.name}</div>
      <div className={brand.profit >= 0 ? "text-emerald-400" : "text-red-400"}>${brand.profit.toLocaleString()}</div>
      <div className="text-white/40">${brand.burn.toLocaleString()}</div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white/5 h-1 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full" style={{ width: `${brand.velocity * 100}%` }} />
        </div>
        <span className="text-[8px] opacity-40">{Math.round(brand.velocity * 100)}%</span>
      </div>
      <div className="text-right">
        <span className={cn(
          "px-2 py-0.5 rounded text-[8px]",
          brand.status === 'INCUBATING' ? "bg-blue-500/20 text-blue-500" : "bg-emerald-500/20 text-emerald-500"
        )}>
          {brand.status}
        </span>
      </div>
    </div>
  );
};
