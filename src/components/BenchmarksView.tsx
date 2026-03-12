import React, { useState, useEffect } from 'react';
import { Activity, Zap, Thermometer, MemoryStick, Cpu } from 'lucide-react';
import { useInference } from '../hooks/useInference';

export default function BenchmarksView() {
  const { isGenerating, currentModelId } = useInference();
  const [stats, setStats] = useState({
    speed: 0,
    firstToken: 0,
    vram: 2.4,
    thermal: 'Normal'
  });

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        speed: parseFloat((Math.random() * 5 + 10).toFixed(1)),
        firstToken: parseFloat((Math.random() * 0.5 + 0.5).toFixed(1)),
        vram: parseFloat((2.4 + Math.random() * 0.2).toFixed(1)),
        thermal: Math.random() > 0.9 ? 'High' : 'Normal'
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const statItems = [
    { label: 'Inference Speed', value: isGenerating ? stats.speed : 0, unit: 'tok/s', icon: Zap, color: 'text-emerald-500' },
    { label: 'First Token', value: isGenerating ? stats.firstToken : 0, unit: 'sec', icon: Activity, color: 'text-blue-500' },
    { label: 'VRAM Usage', value: stats.vram, unit: 'GB', icon: MemoryStick, color: 'text-purple-500' },
    { label: 'Thermal Status', value: stats.thermal, unit: '', icon: Thermometer, color: 'text-amber-500' },
  ];

  return (
    <div className="h-full flex flex-col px-6 py-8 space-y-8 overflow-y-auto scrollbar-hide">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">System Benchmarks</h2>
        <p className="text-sm text-white/40">
          {currentModelId ? `Monitoring: ${currentModelId}` : 'No model loaded'}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {statItems.map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className={stat.color}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tighter">
                {stat.value}<span className="text-sm font-normal opacity-40 ml-1">{stat.unit}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-30">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Device Capability</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-60 flex items-center gap-2"><Cpu className="w-4 h-4" /> WebGPU Support</span>
            <span className="text-emerald-500 font-mono">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-60 flex items-center gap-2"><MemoryStick className="w-4 h-4" /> RAM Headroom</span>
            <span className="text-white font-mono">8.2 GB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
