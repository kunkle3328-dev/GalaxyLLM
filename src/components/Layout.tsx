import React, { useState, useEffect } from 'react';
import { MessageSquare, Database, BarChart3, Settings, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import ChatView from './ChatView';
import ModelManager from './ModelManager';
import BenchmarksView from './BenchmarksView';
import SettingsView from './SettingsView';
import Onboarding from './Onboarding';

type Tab = 'chat' | 'models' | 'benchmarks' | 'settings';

export default function Layout() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('galaxy_onboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('galaxy_onboarded', 'true');
    setShowOnboarding(false);
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'models', label: 'Models', icon: Database },
    { id: 'benchmarks', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden relative">
      <div className="atmosphere" />
      
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between glass-panel z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          <h1 className="text-lg font-semibold tracking-tight uppercase text-white/90">Galaxy LLM Studio</h1>
        </div>
        {isOffline && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <WifiOff className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider">Offline Mode</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {activeTab === 'chat' && <ChatView />}
            {activeTab === 'models' && <ModelManager />}
            {activeTab === 'benchmarks' && <BenchmarksView />}
            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="px-4 pb-8 pt-4 border-t border-white/5 glass-panel z-10">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all duration-300 relative px-4 py-2",
                  isActive ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                <Icon className={cn("w-6 h-6 transition-transform duration-300", isActive && "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]")} />
                <span className="text-[10px] font-medium uppercase tracking-widest">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
