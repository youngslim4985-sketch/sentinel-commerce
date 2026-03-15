import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  Share2, 
  BarChart3, 
  Play, 
  Clock, 
  Eye, 
  MousePointer2,
  TrendingUp,
  Layers,
  Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TrafficCampaign, VideoContent } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TrafficEngineProps {
  campaigns: TrafficCampaign[];
  content: VideoContent[];
}

export const TrafficEngine: React.FC<TrafficEngineProps> = ({ campaigns, content }) => {
  const stats = useMemo(() => {
    const totalViews = campaigns.reduce((acc, c) => acc + c.totalViews, 0);
    const avgCTR = campaigns.length > 0 
      ? campaigns.reduce((acc, c) => acc + c.avgCTR, 0) / campaigns.length 
      : 0;
    const totalVideos = campaigns.reduce((acc, c) => acc + c.videosProduced, 0);

    return { totalViews, avgCTR, totalVideos };
  }, [campaigns]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Traffic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Impressions</p>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xl font-bold">{(stats.totalViews / 1000).toFixed(1)}K</h3>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Avg Click-Through</p>
          <div className="flex items-center gap-2">
            <MousePointer2 className="w-4 h-4 text-blue-500" />
            <h3 className="text-xl font-bold">{(stats.avgCTR * 100).toFixed(2)}%</h3>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Content Velocity</p>
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-500" />
            <h3 className="text-xl font-bold">{stats.totalVideos} <span className="text-[10px] text-white/20">VIDS/MO</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Content Factory Pipeline */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Automated Content Factory
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-white/40 uppercase font-bold">Production Active</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0" />
                {[
                  { label: 'Scripting', icon: Clock, color: 'text-blue-500' },
                  { label: 'Voiceover', icon: Zap, color: 'text-yellow-500' },
                  { label: 'Editing', icon: Video, color: 'text-purple-500' },
                  { label: 'Distribution', icon: Share2, color: 'text-emerald-500' }
                ].map((step, i) => (
                  <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-black border border-white/10 rounded-full flex items-center justify-center">
                      <step.icon className={cn("w-5 h-5", step.color)} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-white/40">{step.label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Active Production Queue</h3>
                {content.slice(0, 5).map((item, i) => (
                  <div key={item.id} className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-10 bg-white/5 rounded flex items-center justify-center">
                        <Play className="w-3 h-3 text-white/20" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/80 uppercase">{item.hookType} HOOK: {item.hookText}</p>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest">{item.brandId} • {item.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-500">{item.views.toLocaleString()}</p>
                        <p className="text-[8px] text-white/20 uppercase">Views</p>
                      </div>
                      <div className="w-12 bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${item.watchTime}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Viral Hook Lab */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl flex flex-col h-full">
            <div className="p-4 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Viral Hook Lab
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {[
                { hook: "Problem hook", performance: 88, text: "Why is everyone buying this?" },
                { hook: "Shock hook", performance: 72, text: "I didn't believe this until I tried it." },
                { hook: "Curiosity hook", performance: 94, text: "This fixed my biggest problem." },
                { hook: "POV hook", performance: 65, text: "Amazon doesn't want you to know this." }
              ].map((test) => (
                <div key={test.hook} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase text-white/60">{test.hook}</span>
                    <span className="text-[9px] font-bold text-emerald-500">{test.performance}%</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-white/5 italic text-[10px] text-white/40">
                    "{test.text}"
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${test.performance}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto p-4 border-t border-white/10 bg-emerald-500/5">
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">AI Recommendation</p>
              <p className="text-[10px] text-white/60 leading-tight">
                "Curiosity hooks are outperforming Problem hooks by 26%. Shifting 80% of production to Curiosity-based scripts."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
