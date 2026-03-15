export interface Brand {
  id: string;
  name: string;
  profit: number;
  burn: number;
  velocity: number;
  status: 'ACTIVE' | 'INCUBATING' | 'PAUSED';
  orders: number;
}

export interface AgentEvent {
  agent: string;
  type: string;
  payload: any;
  timestamp: string;
}

export interface TrafficCampaign {
  id: string;
  brandId: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  videosProduced: number;
  totalViews: number;
  avgCTR: number;
  roas: number;
}

export interface VideoContent {
  id: string;
  brandId: string;
  hookType: 'PROBLEM' | 'SHOCK' | 'CURIOSITY' | 'BEFORE_AFTER' | 'POV';
  hookText: string;
  status: 'SCRIPTING' | 'EDITING' | 'POSTED';
  views: number;
  watchTime: number; // percentage
}

export interface HookTest {
  id: string;
  brandId: string;
  hooks: {
    type: string;
    text: string;
    performance: number; // 0-1 score
  }[];
}
