import React from 'react';
import { Activity, Zap, Thermometer, MemoryStick } from 'lucide-react';

export default function BenchmarksView() {
  const stats = [
    { label: 'Inference Speed', value: '12.4', unit: 'tok/s', icon: Zap, color: 'text-emerald-500' },
    { label: 'First Token', value: '0.8', unit: 'sec', icon: Activity, color: 'text-blue-500' },
    { label: 'VRAM Usage', value: '2.4', unit: 'GB', icon: MemoryStick, color: 'text-purple-500' },
    { label: 'Thermal Status', value: 'Normal', unit: '', icon: Thermometer, color: 'text-amber-500' },
  ];

  return (
    <div className="h-full flex flex-col px-6 py-8 space-y-8 overflow-y-auto scrollbar-hide">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Benchmarks</h2>
        <p className="text-sm text-white/40">Real-time performance metrics for on-device inference.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
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
            <span className="opacity-60">WebGPU Support</span>
            <span className="text-emerald-500 font-mono">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-60">NPU Acceleration</span>
            <span className="text-emerald-500 font-mono">AVAILABLE</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-60">RAM Headroom</span>
            <span className="text-white font-mono">8.2 GB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
