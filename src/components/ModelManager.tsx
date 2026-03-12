import React, { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle2, Trash2, AlertCircle, HardDrive, Info, Cpu, Maximize, ShieldAlert, Plus, WifiOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ModelRecord } from '../services/db';
import { formatBytes, cn } from '../lib/utils';
import { useInference } from '../hooks/useInference';
import { checkWebGPUSupport } from '../lib/webgpu';

const PRESET_MODELS: Partial<ModelRecord>[] = [
  {
    id: 'Phi-3-mini-4k-instruct-q4f32_1-MLC',
    name: 'Phi-3 Mini (3.8B)',
    format: 'webllm',
    sizeBytes: 2300000000,
    version: '1.0',
    estimatedVramBytes: 2500000000,
    architecture: 'Transformer (Phi-3)',
    contextWindow: 4096,
    description: 'A lightweight, high-performance model from Microsoft optimized for mobile and edge devices.'
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
    name: 'Llama 3.1 (8B)',
    format: 'webllm',
    sizeBytes: 4800000000,
    version: '1.0',
    estimatedVramBytes: 5200000000,
    architecture: 'Llama-3.1',
    contextWindow: 8192,
    description: 'Metas latest open-weights model, offering state-of-the-art performance for its size.'
  },
  {
    id: 'gemma-2-2b-it-q4f32_1-MLC',
    name: 'Gemma 2 (2B)',
    format: 'webllm',
    sizeBytes: 1600000000,
    version: '1.0',
    estimatedVramBytes: 1800000000,
    architecture: 'Gemma-2',
    contextWindow: 8192,
    description: 'Googles lightweight model built from the same technology as Gemini, perfect for fast mobile chat.'
  },
  {
    id: 'Qwen2-1.5B-Instruct-q4f32_1-MLC',
    name: 'Qwen2 (1.5B)',
    format: 'webllm',
    sizeBytes: 1100000000,
    version: '1.0',
    estimatedVramBytes: 1300000000,
    architecture: 'Qwen2',
    contextWindow: 32768,
    description: 'Highly capable small model from Alibaba Cloud with excellent multilingual support.'
  },
  {
    id: 'TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC',
    name: 'TinyLlama (1.1B)',
    format: 'webllm',
    sizeBytes: 750000000,
    version: '1.0',
    estimatedVramBytes: 900000000,
    architecture: 'Llama',
    contextWindow: 2048,
    description: 'Extremely fast and lightweight model, ideal for devices with very limited RAM.'
  },
  {
    id: 'Mistral-7B-Instruct-v0.3-q4f32_1-MLC',
    name: 'Mistral (7B) v0.3',
    format: 'webllm',
    sizeBytes: 4200000000,
    version: '1.0',
    estimatedVramBytes: 4800000000,
    architecture: 'Mistral',
    contextWindow: 8192,
    description: 'Powerful 7B model known for strong reasoning and coding capabilities.'
  },
  {
    id: 'Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC',
    name: 'Hermes 2 Pro (8B)',
    format: 'webllm',
    sizeBytes: 4800000000,
    version: '1.0',
    estimatedVramBytes: 5200000000,
    architecture: 'Llama-3',
    contextWindow: 8192,
    description: 'Fine-tuned Llama 3 model optimized for function calling and structured outputs.'
  },
  {
    id: 'Qwen2-7B-Instruct-q4f32_1-MLC',
    name: 'Qwen2 (7B)',
    format: 'webllm',
    sizeBytes: 4500000000,
    version: '1.0',
    estimatedVramBytes: 5000000000,
    architecture: 'Qwen2',
    contextWindow: 32768,
    description: 'Larger Qwen2 variant with exceptional performance across diverse tasks.'
  },
  {
    id: 'gemma-2-9b-it-q4f32_1-MLC',
    name: 'Gemma 2 (9B)',
    format: 'webllm',
    sizeBytes: 5500000000,
    version: '1.0',
    estimatedVramBytes: 6000000000,
    architecture: 'Gemma-2',
    contextWindow: 8192,
    description: 'Googles highly capable 9B model, punching above its weight class.'
  },
  {
    id: 'RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC',
    name: 'RedPajama (3B)',
    format: 'webllm',
    sizeBytes: 2100000000,
    version: '1.0',
    estimatedVramBytes: 2400000000,
    architecture: 'GPT-NeoX',
    contextWindow: 2048,
    description: 'Open-source model trained on the RedPajama dataset.'
  },
  {
    id: 'stablelm-2-zephyr-1_6b-q4f32_1-MLC',
    name: 'StableLM Zephyr (1.6B)',
    format: 'webllm',
    sizeBytes: 1200000000,
    version: '1.0',
    estimatedVramBytes: 1500000000,
    architecture: 'StableLM',
    contextWindow: 4096,
    description: 'Fast and capable small model from Stability AI.'
  }
];

export default function ModelManager() {
  const { init, progress, isInitializing } = useInference();
  const [gpuStatus, setGpuStatus] = useState<{ supported: boolean; hasF16: boolean; error?: string } | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Custom model state
  const [customModelId, setCustomModelId] = useState('');
  const [customModelUrl, setCustomModelUrl] = useState('');
  const [customQuantization, setCustomQuantization] = useState('q4f32_1');
  const [customMode, setCustomMode] = useState<'id' | 'url' | 'file'>('id');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const localModels = useLiveQuery(() => db.models.toArray()) || [];

  useEffect(() => {
    checkWebGPUSupport().then(setGpuStatus);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startDownload = async (model: Partial<ModelRecord>) => {
    try {
      // Real initialization triggers the download/caching in WebLLM
      // This will now continue in the background via the singleton service
      await init(model.id!, model.modelUrl);
      
      await db.models.put({
        ...model as ModelRecord,
        status: 'ready',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const deleteModel = async (id: string) => {
    await db.models.delete(id);
  };

  const handleAddCustomModel = async () => {
    if (customMode === 'id' && !customModelId.trim()) return;
    if (customMode === 'url' && (!customModelId.trim() || !customModelUrl.trim())) return;
    
    const fullId = customMode === 'id' 
      ? `${customModelId.trim()}-${customQuantization}-MLC`
      : customModelId.trim();
    
    const customModel: Partial<ModelRecord> = {
      id: fullId,
      name: customModelId.trim() || 'Custom Model',
      format: 'webllm',
      sizeBytes: 0,
      version: '1.0',
      architecture: 'Custom',
      description: customMode === 'url' ? `Loaded from ${customModelUrl}` : 'Manually added custom model.',
      modelUrl: customMode === 'url' ? customModelUrl.trim() : undefined,
    };
    
    await startDownload(customModel);
    setCustomModelId('');
    setCustomModelUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const config = JSON.parse(content);
        
        if (config.model_id) {
          const customModel: Partial<ModelRecord> = {
            id: config.model_id,
            name: config.name || config.model_id,
            format: 'webllm',
            sizeBytes: config.sizeBytes || 0,
            version: config.version || '1.0',
            architecture: config.architecture || 'Custom',
            description: 'Loaded from configuration file.'
          };
          await startDownload(customModel);
        } else {
          alert('Invalid configuration file: missing model_id');
        }
      } catch (err) {
        alert('Failed to parse configuration file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col px-6 py-8 space-y-8 overflow-y-auto scrollbar-hide">
      <header className="space-y-2 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Model Manager</h2>
          <p className="text-sm text-white/40">Download and manage on-device LLMs. Weights are stored in app-private storage.</p>
        </div>
        {isOffline && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Offline</span>
          </div>
        )}
      </header>

      {/* Custom Model Form */}
      <div className="p-6 rounded-3xl glass-panel space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Custom Model</h3>
            <p className="text-xs text-white/40">Load weights via HuggingFace ID, URL, or Config File.</p>
          </div>
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
            {(['id', 'url', 'file'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setCustomMode(mode)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                  customMode === mode ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {customMode === 'id' && (
            <div className="flex gap-3">
              <input 
                type="text" 
                value={customModelId}
                onChange={(e) => setCustomModelId(e.target.value)}
                placeholder="HuggingFace Repo ID (e.g., Llama-3-8B-Instruct)"
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
              />
              <select 
                value={customQuantization}
                onChange={(e) => setCustomQuantization(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
              >
                <option value="q4f32_1">q4f32_1 (Max Compatibility)</option>
                <option value="q4f16_1">q4f16_1 (Standard)</option>
                <option value="q8f16_1">q8f16_1 (High Quality)</option>
              </select>
            </div>
          )}

          {customMode === 'url' && (
            <div className="flex gap-3">
              <input 
                type="text" 
                value={customModelId}
                onChange={(e) => setCustomModelId(e.target.value)}
                placeholder="Model Name / ID"
                className="w-1/3 bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
              />
              <input 
                type="text" 
                value={customModelUrl}
                onChange={(e) => setCustomModelUrl(e.target.value)}
                placeholder="Model Base URL (e.g., https://huggingface.co/.../resolve/main/)"
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
              />
            </div>
          )}

          {customMode === 'file' && (
            <div className="flex items-center gap-3">
              <input 
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-white/10 rounded-2xl px-4 py-8 text-sm text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3"
              >
                <HardDrive className="w-6 h-6" />
                <span>Click to upload mlc-chat-config.json</span>
              </button>
            </div>
          )}

          {customMode !== 'file' && (
            <button 
              onClick={handleAddCustomModel}
              disabled={!customModelId.trim() || (customMode === 'url' && !customModelUrl.trim()) || isOffline}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-emerald-500 w-full shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <Plus className="w-4 h-4" /> Add Model
            </button>
          )}
        </div>
      </div>

      {gpuStatus && !gpuStatus.hasF16 && gpuStatus.supported && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
          <Info className="w-6 h-6 text-blue-400 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Compatibility Mode Active</p>
            <p className="text-[11px] text-blue-400/70 leading-relaxed">
              Your browser doesn't support 16-bit float shaders (shader-f16). 
              We've automatically switched to 32-bit models for maximum compatibility.
            </p>
          </div>
        </div>
      )}

      {gpuStatus && !gpuStatus.supported && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-4">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">WebGPU Not Supported</p>
            <p className="text-[11px] text-red-400/70 leading-relaxed">
              {gpuStatus.error || "WebGPU is required for on-device inference. Please use a compatible browser like Chrome or Edge."}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {PRESET_MODELS.map((model) => {
          const local = localModels.find(m => m.id === model.id);
          const isDownloading = isInitializing && progress?.modelId === model.id;
          const isReady = local?.status === 'ready';
          const currentProgress = isDownloading ? Math.round((progress?.progress || 0) * 100) : 0;

          return (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-6 space-y-5 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-emerald-400 tracking-tight">{model.name}</h3>
                  <p className="text-xs text-white/60 leading-relaxed max-w-md">
                    {model.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/5 rounded-lg text-[10px] uppercase font-bold tracking-wider opacity-80">
                      <Cpu className="w-3 h-3 text-emerald-500" /> {model.architecture}
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/5 rounded-lg text-[10px] uppercase font-bold tracking-wider opacity-80">
                      <Maximize className="w-3 h-3 text-blue-500" /> {model.contextWindow} ctx
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/5 rounded-lg text-[10px] uppercase font-bold tracking-wider opacity-80">
                      <HardDrive className="w-3 h-3 text-purple-500" /> {formatBytes(model.sizeBytes || 0)}
                    </div>
                  </div>
                </div>
                {isReady ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                ) : isDownloading ? (
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-emerald-400 font-mono text-xl font-bold">{currentProgress}%</div>
                    <div className="text-[9px] uppercase tracking-tighter opacity-40">Downloading...</div>
                  </div>
                ) : (
                  <button 
                    onClick={() => startDownload(model)}
                    disabled={isOffline}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                )}
              </div>

              {isDownloading && (
                <div className="space-y-2">
                  <div className="h-2 w-full bg-black/50 border border-white/5 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${currentProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono opacity-40 truncate">
                    {progress?.status || 'Initializing...'}
                  </div>
                </div>
              )}

              {isReady && (
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-emerald-500/80 uppercase font-bold tracking-widest">Cached Locally</span>
                  </div>
                  <button 
                    onClick={() => deleteModel(model.id!)}
                    className="flex items-center gap-2 text-[10px] text-red-400/60 hover:text-red-400 uppercase font-bold tracking-widest transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Storage Warning</p>
          <p className="text-[11px] text-amber-500/70 leading-relaxed">
            Models are large files. Ensure you have enough storage space on your Galaxy S25. 
            Downloaded data is persistent and works fully offline.
          </p>
        </div>
      </div>
    </div>
  );
}
