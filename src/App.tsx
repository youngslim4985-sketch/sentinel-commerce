import React, { useEffect, useState, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Activity, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Power,
  Search,
  LayoutGrid,
  List as ListIcon,
  AlertCircle,
  Shield,
  Cloud, 
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

// Local Imports
import { FirebaseProvider, useAuth } from './lib/FirebaseProvider';
import { db } from './lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { Brand, AgentEvent, TrafficCampaign, VideoContent } from './types';
import { StatCard } from './components/StatCard';
import { BrandCard, BrandRow } from './components/BrandComponents';
import { TrafficEngine } from './components/TrafficEngine';
import { brandService } from './services/brandService';
import { eventService } from './services/eventService';
import { trafficService } from './services/trafficService';
import { ErrorBoundary } from './components/ErrorBoundary';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [campaigns, setCampaigns] = useState<TrafficCampaign[]>([]);
  const [content, setContent] = useState<VideoContent[]>([]);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'traffic'>('portfolio');
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [isEmergencyStop, setIsEmergencyStop] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const eventEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'system', 'health'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          setConnectionError("Firebase configuration error: Client is offline.");
        }
      }
    };
    testConnection();

    socketRef.current = io();
    
    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    socketRef.current.on('agent_event', async (event: AgentEvent) => {
      // Log to Firestore - the subscription will update the UI
      try {
        await eventService.logEvent(event);
      } catch (e) {
        console.error("Failed to log event to Firestore", e);
        // Fallback: update UI directly if Firestore fails
        setEvents(prev => [event, ...prev].slice(0, 50));
      }
    });

    socketRef.current.on('metrics_update', (updatedBrands: Brand[]) => {
      setBrands(updatedBrands);
    });

    // Subscribe to traffic data
    const unsubscribeCampaigns = trafficService.subscribeToCampaigns(setCampaigns);
    const unsubscribeContent = trafficService.subscribeToContent(setContent);

    // Subscribe to persistent events - this is our source of truth for the feed
    const unsubscribeEvents = eventService.subscribeToEvents((persistentEvents) => {
      setEvents(persistentEvents);
    });

    return () => {
      socketRef.current?.disconnect();
      unsubscribeEvents();
      unsubscribeCampaigns();
      unsubscribeContent();
    };
  }, []);

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      await Promise.all(brands.map(b => brandService.saveBrand(b)));
      console.log("All brands synced to Firestore");
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    eventEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const metrics = useMemo(() => {
    const totalProfit = brands.reduce((acc, b) => acc + b.profit, 0);
    const totalBurn = brands.reduce((acc, b) => acc + b.burn, 0);
    const avgVelocity = brands.length > 0 
      ? brands.reduce((acc, b) => acc + b.velocity, 0) / brands.length 
      : 0;
    const incubatorCount = brands.filter(b => b.status === 'INCUBATING').length;

    return {
      netProfit: totalProfit - totalBurn,
      totalBurn,
      avgVelocity,
      incubatorCount
    };
  }, [brands]);

  const filteredBrands = useMemo(() => {
    return brands.filter(b => 
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [brands, search]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#E4E3E0] font-mono selection:bg-emerald-500/30">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest uppercase">Aegis Master Hub</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Autonomous Enterprise OS v4.2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-black/40 p-1 rounded border border-white/10">
              <button 
                onClick={() => setActiveTab('portfolio')}
                className={cn(
                  "px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'portfolio' ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
                )}
              >
                Portfolio
              </button>
              <button 
                onClick={() => setActiveTab('traffic')}
                className={cn(
                  "px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'traffic' ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
                )}
              >
                Traffic Engine
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
              <span className="text-[10px] uppercase font-bold tracking-widest">
                {isConnected ? "Event Bus Online" : "Bus Offline"}
              </span>
            </div>
            
            <button 
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                isSyncing 
                  ? "bg-emerald-500/20 text-emerald-500 animate-pulse" 
                  : "bg-white/5 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-500 border border-white/10"
              )}
            >
              <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing..." : "Sync to Cloud"}
            </button>

            <button 
              onClick={() => setIsEmergencyStop(!isEmergencyStop)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                isEmergencyStop 
                  ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                  : "bg-white/5 text-white/60 hover:bg-red-500/20 hover:text-red-500 border border-white/10"
              )}
            >
              <Power className="w-3 h-3" />
              {isEmergencyStop ? "Emergency Stop Active" : "Kill Switch"}
            </button>

            <div className="h-8 w-[1px] bg-white/10" />
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-bold">{user?.displayName}</p>
                <button onClick={logout} className="text-[9px] text-white/40 hover:text-white uppercase">Disconnect</button>
              </div>
              <img src={user?.photoURL || ''} className="w-8 h-8 rounded-full border border-white/20" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {connectionError && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded flex items-center gap-3 text-red-500 text-xs">
            <AlertCircle className="w-4 h-4" />
            {connectionError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            label="Portfolio Net Profit" 
            value={`$${metrics.netProfit.toLocaleString()}`} 
            trend={metrics.netProfit > 0 ? 'up' : 'down'}
            subValue="Real-time Stripe Sync"
          />
          <StatCard 
            label="Active Burn Rate" 
            value={`$${metrics.totalBurn.toLocaleString()}`} 
            trend="neutral"
            subValue="Ad Spend + Ops"
          />
          <StatCard 
            label="Agent Velocity" 
            value={metrics.avgVelocity.toFixed(2)} 
            trend="up"
            subValue="Decision Flow Rate"
          />
          <StatCard 
            label="Incubator Queue" 
            value={metrics.incubatorCount} 
            trend="neutral"
            subValue="Ready for Private Label"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {activeTab === 'portfolio' ? (
            <>
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-emerald-500" />
                        Portfolio Control
                      </h2>
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                          type="text" 
                          placeholder="SEARCH BRANDS..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded py-1 pl-8 pr-4 text-[10px] focus:outline-none focus:border-emerald-500/50 w-48"
                        />
                      </div>
                    </div>
                    <div className="flex bg-black/40 p-1 rounded border border-white/10">
                      <button 
                        onClick={() => setView('grid')}
                        className={cn("p-1.5 rounded transition-all", view === 'grid' ? "bg-white/10 text-white" : "text-white/20")}
                      >
                        <LayoutGrid className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => setView('list')}
                        className={cn("p-1.5 rounded transition-all", view === 'list' ? "bg-white/10 text-white" : "text-white/20")}
                      >
                        <ListIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {view === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {filteredBrands.map(brand => (
                          <BrandCard key={brand.id} brand={brand} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredBrands.map(brand => (
                          <BrandRow key={brand.id} brand={brand} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-[300px]">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest mb-6 opacity-40">Portfolio Performance Matrix</h2>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={brands.slice(0, 15)}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl h-full flex flex-col">
                  <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      Agent Pulse
                    </h2>
                    <span className="text-[9px] text-white/20 uppercase tracking-tighter">Live WebSocket Feed</span>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[850px] custom-scrollbar">
                    <AnimatePresence initial={false}>
                      {events.map((event, i) => (
                        <motion.div 
                          key={event.timestamp + i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest",
                              event.agent === 'CEOAgent' ? "bg-emerald-500/20 text-emerald-500" :
                              event.agent === 'PricingAgent' ? "bg-blue-500/20 text-blue-500" :
                              event.agent === 'TrafficAgent' ? "bg-emerald-500/20 text-emerald-500" :
                              "bg-purple-500/20 text-purple-500"
                            )}>
                              {event.agent}
                            </span>
                            <span className="text-[8px] text-white/20">{format(new Date(event.timestamp), 'HH:mm:ss')}</span>
                          </div>
                          <p className="text-[10px] font-bold text-white/80 uppercase leading-tight">{event.type.replace(/_/g, ' ')}</p>
                          <div className="bg-black/60 p-2 rounded border border-white/5">
                            <pre className="text-[9px] text-emerald-500/60 overflow-x-auto">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={eventEndRef} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-12">
              <TrafficEngine campaigns={campaigns} content={content} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Login = () => {
  const { login } = useAuth();
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <Cpu className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white uppercase">Aegis Master Hub</h1>
          <p className="text-white/40 text-sm uppercase tracking-widest leading-relaxed">
            Autonomous Enterprise Control Room<br/>
            Multi-Agent Portfolio Management
          </p>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              <ShieldAlert className="w-3 h-3" />
              Security Protocol Active
            </div>
            <p className="text-[11px] text-white/20 text-left leading-relaxed">
              ACCESS RESTRICTED TO AUTHORIZED FOUNDERS ONLY. BIOMETRIC AND CRYPTOGRAPHIC VERIFICATION REQUIRED.
            </p>
          </div>
          
          <button 
            onClick={login}
            className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 group"
          >
            <Zap className="w-4 h-4 fill-black group-hover:scale-125 transition-transform" />
            Initialize Connection
          </button>
          
          <p className="text-[9px] text-white/10 uppercase tracking-tighter">
            By connecting, you agree to the Autonomous Enterprise Governance protocols.
          </p>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.3em] animate-pulse">Syncing Neural Link...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
