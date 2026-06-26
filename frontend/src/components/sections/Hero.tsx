'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, TrendingUp } from 'lucide-react';

interface HeroProps {
  onGenerateClick: () => void;
}

export default function Hero({ onGenerateClick }: HeroProps) {
  // Reveal text animation variables
  const containerVars = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVars = {
    initial: { y: 30, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // Custom premium cubic-bezier ease
      },
    },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between pt-24 pb-12 px-6 sm:px-12 md:px-24 overflow-hidden z-20">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyber-blue opacity-5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-neon-green opacity-5 blur-[150px] pointer-events-none" />

      {/* Futuristic Floating Data Tags */}
      <div className="absolute top-1/3 left-10 md:left-24 hidden md:block">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 border border-cyber-blue/20"
        >
          <Sparkles className="w-4 h-4 text-cyber-blue animate-pulse" />
          <span className="text-[10px] font-mono tracking-wider text-cyber-blue/80">NEURAL ENGINE ACTIVE</span>
        </motion.div>
      </div>

      <div className="absolute top-1/2 right-10 md:right-24 hidden md:block">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 border border-neon-green/20"
        >
          <TrendingUp className="w-4 h-4 text-neon-green" />
          <span className="text-[10px] font-mono tracking-wider text-neon-green/80">60 FPS REALTIME SIMULATION</span>
        </motion.div>
      </div>

      {/* Main Copy */}
      <div className="flex-1 flex flex-col justify-center items-center text-center max-w-4xl mx-auto z-10">
        <motion.div
          variants={containerVars}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-6"
        >
          <motion.div variants={itemVars} className="flex justify-center">
            <span className="text-xs font-mono tracking-[0.3em] uppercase bg-gradient-to-r from-cyber-blue to-neon-green bg-clip-text text-transparent px-4 py-1.5 rounded-full border border-cyber-blue/10 glass-panel">
              SYSTEM v1.0.9 ACTIVATED
            </span>
          </motion.div>

          <motion.h1
            variants={itemVars}
            className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tight leading-[0.95]"
          >
            Your Future Body.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-foreground to-neon-green">
              Simulated
            </span> Before You Build It.
          </motion.h1>

          <motion.p
            variants={itemVars}
            className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto font-sans font-light leading-relaxed"
          >
            AI analyzes your body, predicts progress, and generates personalized training and nutrition plans.
          </motion.p>

          <motion.div
            variants={itemVars}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6"
          >
            <button
              onClick={onGenerateClick}
              data-cursor-text="EVOLVE"
              className="relative px-8 py-4 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-semibold text-xs tracking-widest uppercase rounded-lg shadow-lg hover:shadow-neon-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 pointer-events-auto"
            >
              Generate My Fitness Blueprint
            </button>

            <a
              href="#dashboard-preview"
              data-cursor-text="WATCH"
              className="px-8 py-4 border border-white/10 glass-panel hover:bg-white/5 hover:border-white/20 text-white font-semibold text-xs tracking-widest uppercase rounded-lg transition-all duration-300 pointer-events-auto"
            >
              Watch Demo
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Info / Scroll Indicator */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mt-12 border-t border-white/5 pt-8 font-mono text-[10px] tracking-widest text-gray-500 z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-cyber-blue" />
          <span>ENCRYPTED BIO-DATA TRANSMISSION SECURED</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="animate-bounce mb-1 text-cyber-blue">▼</span>
          <span>SCROLL TO INITIALIZE NEURAL SCAN</span>
        </div>
        <div>
          <span>FITFORGE // CORP© 2026</span>
        </div>
      </div>
    </section>
  );
}
