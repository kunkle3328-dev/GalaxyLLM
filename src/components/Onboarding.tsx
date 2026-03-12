import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Database, MessageSquare, Settings, ChevronRight, Zap, Shield, Cpu } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      title: "Welcome to Galaxy LLM",
      subtitle: "The Future of Local Intelligence",
      description: "Experience the power of advanced language models running entirely on your device. Zero latency. Complete privacy. No subscriptions.",
      icon: Sparkles,
      color: "from-emerald-400 to-emerald-600",
      glow: "rgba(16,185,129,0.4)",
      features: [
        { icon: Zap, text: "Instant Responses" },
        { icon: Shield, text: "100% Private" },
        { icon: Cpu, text: "WebGPU Accelerated" }
      ]
    },
    {
      title: "Model Ecosystem",
      subtitle: "Choose Your Intelligence",
      description: "Download and manage state-of-the-art models like Llama 3, Phi-3, and Gemma 2. Tailor your AI to your specific needs.",
      icon: Database,
      color: "from-blue-400 to-blue-600",
      glow: "rgba(59,130,246,0.4)",
      features: [
        { icon: Database, text: "Multiple Architectures" },
        { icon: Zap, text: "Quantized for Speed" },
        { icon: Shield, text: "Secure Storage" }
      ]
    },
    {
      title: "Fluid Conversations",
      subtitle: "Context-Aware Chat",
      description: "Engage in deep, meaningful dialogues. Our advanced chat interface supports Markdown, code highlighting, and persistent history.",
      icon: MessageSquare,
      color: "from-purple-400 to-purple-600",
      glow: "rgba(168,85,247,0.4)",
      features: [
        { icon: MessageSquare, text: "Rich Formatting" },
        { icon: Database, text: "Local History" },
        { icon: Zap, text: "Streaming Output" }
      ]
    },
    {
      title: "Precision Control",
      subtitle: "Tune Your Experience",
      description: "Fine-tune generation parameters. Adjust temperature, top-p, and max tokens to get the exact response style you need.",
      icon: Settings,
      color: "from-amber-400 to-amber-600",
      glow: "rgba(245,158,11,0.4)",
      features: [
        { icon: Settings, text: "Granular Settings" },
        { icon: Shield, text: "Privacy Controls" },
        { icon: Cpu, text: "Hardware Config" }
      ]
    }
  ];

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
    setTimeout(() => setIsAnimating(false), 600);
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-[#050505]/90 backdrop-blur-2xl overflow-hidden">
      {/* Dynamic Background Glow */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{ 
          background: `radial-gradient(circle at 50% 50%, ${steps[step].glow} 0%, transparent 70%)` 
        }}
        transition={{ duration: 1 }}
      />
      
      <div className="w-full max-w-4xl h-[600px] max-h-[90vh] flex flex-col md:flex-row glass-panel rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative z-10">
        
        {/* Left Side - Visuals */}
        <div className="hidden md:flex flex-1 relative bg-black/40 items-center justify-center p-12 overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${steps[step].color} blur-3xl opacity-20 rounded-full`} />
              <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${steps[step].color} p-[1px] shadow-2xl`}>
                <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${steps[step].color} opacity-10`} />
                  <CurrentIcon className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] relative z-10" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 flex flex-col p-8 sm:p-12 relative">
          <div className="flex justify-between items-center mb-12">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
            <button 
              onClick={onComplete}
              className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              Skip
            </button>
          </div>

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="md:hidden mb-6 flex justify-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${steps[step].color} p-[1px]`}>
                    <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                      <CurrentIcon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${steps[step].color}`}>
                  {steps[step].subtitle}
                </h3>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-white">
                  {steps[step].title}
                </h2>
                <p className="text-base text-white/60 leading-relaxed mb-8">
                  {steps[step].description}
                </p>

                <div className="space-y-4 mt-auto mb-8">
                  {steps[step].features.map((feature, idx) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                          <FeatureIcon className="w-4 h-4 text-white/80" />
                        </div>
                        <span className="text-sm font-medium text-white/80">{feature.text}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={handleNext}
              disabled={isAnimating}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {step < steps.length - 1 ? 'Continue' : 'Launch Studio'}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
