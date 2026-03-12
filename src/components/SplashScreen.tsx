import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 800);
    const timer2 = setTimeout(() => setStage(2), 2500);
    const timer3 = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Cinematic Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.05)_0%,_transparent_50%)]" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, filter: 'blur(20px)' }}
          animate={{ 
            scale: stage >= 1 ? 1 : 0.8, 
            opacity: stage >= 1 ? 1 : 0,
            filter: stage >= 1 ? 'blur(0px)' : 'blur(20px)'
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Logo Container */}
          <div className="relative mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-emerald-500/20 border-t-emerald-500/80 w-24 h-24 -m-2"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-blue-500/20 border-b-blue-500/80 w-28 h-28 -m-4"
            />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 p-[1px] shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-600/20" />
                <Sparkles className="w-8 h-8 text-emerald-400 relative z-10" />
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="text-center overflow-hidden">
            <motion.h1 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: stage >= 1 ? 0 : 40, opacity: stage >= 1 ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-bold tracking-tighter text-white mb-2"
            >
              GALAXY <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">LLM</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: stage >= 1 ? 0 : 20, opacity: stage >= 1 ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm text-white/40 tracking-widest uppercase font-medium"
            >
              Local Intelligence Studio
            </motion.p>
          </div>

          {/* Loading Bar */}
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ 
              opacity: stage >= 1 ? 1 : 0,
              width: stage >= 2 ? 200 : (stage >= 1 ? 100 : 0)
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 mt-12 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
