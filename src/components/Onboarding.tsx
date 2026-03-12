import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Database, MessageSquare, Settings, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Galaxy LLM Studio",
      description: "Experience the power of local AI. Run advanced language models directly on your device with zero latency and complete privacy.",
      icon: Sparkles,
      color: "text-emerald-400"
    },
    {
      title: "Download Models",
      description: "Head to the Models tab to download optimized LLMs. We support a wide range of architectures from Llama 3 to Gemma 2.",
      icon: Database,
      color: "text-blue-400"
    },
    {
      title: "Chat & Generate",
      description: "Engage in fluid conversations. The models run locally, meaning your data never leaves your device.",
      icon: MessageSquare,
      color: "text-purple-400"
    },
    {
      title: "Advanced Settings",
      description: "Tweak generation parameters like temperature and top-p to get the exact response style you need.",
      icon: Settings,
      color: "text-amber-400"
    }
  ];

  const CurrentIcon = steps[step].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
      <div className="atmosphere" />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel rounded-3xl p-8 max-w-sm w-full relative overflow-hidden flex flex-col items-center text-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className={`w-20 h-20 rounded-full glass-panel flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${steps[step].color}`}
          >
            <CurrentIcon className="w-10 h-10" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-3 tracking-tight text-white/90">{steps[step].title}</h2>
          <p className="text-sm text-white/60 leading-relaxed mb-8">
            {steps[step].description}
          </p>

          <div className="flex items-center justify-between w-full mt-auto">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'w-1.5 bg-white/20'}`}
                />
              ))}
            </div>
            
            <button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(step + 1);
                } else {
                  onComplete();
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {step < steps.length - 1 ? 'Next' : 'Get Started'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
