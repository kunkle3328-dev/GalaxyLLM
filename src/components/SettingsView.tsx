import React, { useState, useEffect } from 'react';
import { Shield, Cpu, Cloud, Info, Github, SlidersHorizontal, Zap, Trash2 } from 'lucide-react';
import { db } from '../services/db';

export default function SettingsView() {
  const [temperature, setTemperature] = useState(() => parseFloat(localStorage.getItem('nova_temperature') || '0.7'));
  const [topP, setTopP] = useState(() => parseFloat(localStorage.getItem('nova_topP') || '0.9'));
  const [maxTokens, setMaxTokens] = useState(() => parseInt(localStorage.getItem('nova_maxTokens') || '2048', 10));
  const [inferenceMode, setInferenceMode] = useState(() => localStorage.getItem('nova_inferenceMode') || 'local');
  const [localOnly, setLocalOnly] = useState(() => localStorage.getItem('nova_localOnly') !== 'false');
  const [anonBenchmarking, setAnonBenchmarking] = useState(() => localStorage.getItem('nova_anonBench') === 'true');
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('nova_temperature', temperature.toString());
  }, [temperature]);

  useEffect(() => {
    localStorage.setItem('nova_topP', topP.toString());
  }, [topP]);

  useEffect(() => {
    localStorage.setItem('nova_maxTokens', maxTokens.toString());
  }, [maxTokens]);

  useEffect(() => {
    localStorage.setItem('nova_inferenceMode', inferenceMode);
  }, [inferenceMode]);

  useEffect(() => {
    localStorage.setItem('nova_localOnly', localOnly.toString());
  }, [localOnly]);

  useEffect(() => {
    localStorage.setItem('nova_anonBench', anonBenchmarking.toString());
  }, [anonBenchmarking]);

  const handlePurge = async () => {
    localStorage.clear();
    await db.delete();
    window.location.reload();
  };

  return (
    <div className="h-full flex flex-col px-6 py-8 space-y-8 overflow-y-auto scrollbar-hide">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-white/40">Configure your local environment and privacy.</p>
      </header>
      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40 flex items-center gap-2">
            <SlidersHorizontal className="w-3 h-3" /> Model Parameters
          </h3>
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-xl">
            {/* Temperature Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-white/90">Temperature</label>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">{temperature.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">Controls randomness. Lower values are more focused, higher values are more creative.</p>
              <input 
                type="range" 
                min="0" max="2" step="0.05" 
                value={temperature} 
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="h-px w-full bg-white/5" />

            {/* Top P Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-white/90">Top P</label>
                <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">{topP.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">Nucleus sampling. Limits token selection to a cumulative probability threshold.</p>
              <input 
                type="range" 
                min="0" max="1" step="0.05" 
                value={topP} 
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="h-px w-full bg-white/5" />

            {/* Max Tokens Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-white/90">Max Output Tokens</label>
                <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md">{maxTokens}</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">The maximum number of tokens to generate in the response.</p>
              <input 
                type="range" 
                min="256" max="16384" step="256" 
                value={maxTokens} 
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40 flex items-center gap-2">
            <Zap className="w-3 h-3" /> Inference Mode
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => setInferenceMode('local')}
              className={`w-full flex items-center justify-between p-5 glass-panel rounded-3xl text-left shadow-lg transition-all hover:scale-[1.02] ${inferenceMode === 'local' ? 'border-emerald-500/30 bg-emerald-500/5' : 'opacity-50 hover:opacity-80'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${inferenceMode === 'local' ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                  <Cpu className={`w-5 h-5 ${inferenceMode === 'local' ? 'text-emerald-400' : 'text-white/60'}`} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">On-Device (Default)</div>
                  <div className="text-[10px] opacity-60 uppercase tracking-wider mt-0.5">WebGPU Accelerated</div>
                </div>
              </div>
              {inferenceMode === 'local' ? (
                <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-white/20" />
              )}
            </button>
            <button 
              onClick={() => setInferenceMode('cloud')}
              className={`w-full flex items-center justify-between p-5 glass-panel rounded-3xl text-left transition-all ${inferenceMode === 'cloud' ? 'border-blue-500/30 bg-blue-500/5 shadow-lg hover:scale-[1.02]' : 'opacity-50 hover:opacity-80'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${inferenceMode === 'cloud' ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                  <Cloud className={`w-5 h-5 ${inferenceMode === 'cloud' ? 'text-blue-400' : 'text-white/60'}`} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Cloud Fallback</div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5">Gemini API Integration</div>
                </div>
              </div>
              {inferenceMode === 'cloud' ? (
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-white/20" />
              )}
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Privacy & Security
          </h3>
          <div className="glass-panel rounded-3xl divide-y divide-white/5 shadow-xl overflow-hidden">
            <div 
              className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setLocalOnly(!localOnly)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${localOnly ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                  <Shield className={`w-5 h-5 ${localOnly ? 'text-blue-400' : 'text-white/40'}`} />
                </div>
                <span className="text-sm font-semibold text-white/90">Local-Only Storage</span>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${localOnly ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-black/40 border border-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${localOnly ? 'right-1 bg-white shadow-sm' : 'left-1 bg-white/40'}`} />
              </div>
            </div>
            <div 
              className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setAnonBenchmarking(!anonBenchmarking)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${anonBenchmarking ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                  <Info className={`w-5 h-5 ${anonBenchmarking ? 'text-amber-400' : 'text-white/40'}`} />
                </div>
                <span className="text-sm font-semibold text-white/90">Anonymous Benchmarking</span>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${anonBenchmarking ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-black/40 border border-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${anonBenchmarking ? 'right-1 bg-white shadow-sm' : 'left-1 bg-white/40'}`} />
              </div>
            </div>
          </div>
        </section>

        <section className="pt-4 flex flex-col items-center gap-4 text-white/20">
          <div className="flex items-center gap-4">
            <Github className="w-5 h-5" />
            <span className="text-xs font-mono uppercase tracking-widest">v1.0.0-alpha</span>
          </div>
          <p className="text-[10px] text-center max-w-[200px] leading-relaxed">
            Built for Galaxy S25. No data leaves this device.
          </p>
        </section>
        
        <section className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40 flex items-center gap-2">
            <Trash2 className="w-3 h-3" /> Danger Zone
          </h3>
          <div className="glass-panel rounded-3xl p-6 shadow-xl border border-red-500/10">
            <button 
              onClick={() => setShowPurgeConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Purge All Data & Reset
            </button>
            {showPurgeConfirm && (
              <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-red-500/20 space-y-3">
                <p className="text-xs text-white/60">Are you sure? This will delete all models, chat history, and settings. This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={handlePurge} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold text-xs">Yes, Purge Everything</button>
                  <button onClick={() => setShowPurgeConfirm(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white font-bold text-xs">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
