'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Dumbbell, Flame, Activity, ChevronRight, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  // Container animation variants for clean loading cascade
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
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  // Background particles animation parameters
  const particles = [
    { x: -120, y: -80, size: 8, delay: 0.2, color: 'bg-cyber-blue' },
    { x: 140, y: -100, size: 12, delay: 0.4, color: 'bg-neon-green' },
    { x: -180, y: 120, size: 6, delay: 0.6, color: 'bg-neon-green' },
    { x: 190, y: 80, size: 10, delay: 0.8, color: 'bg-cyber-blue' },
  ];

  return (
    <section 
      id="blueprint-generator" 
      className="relative w-full h-screen snap-start snap-always py-24 px-6 sm:px-12 md:px-24 flex items-center justify-center overflow-hidden z-20 shrink-0 select-none"
    >
      {/* Background blur flares */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-green opacity-[0.03] blur-[220px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyber-blue opacity-[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />

      {/* Floating Background Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.2, 0.5, 0.2], 
            scale: [1, 1.2, 1],
            x: [p.x, p.x + (i % 2 === 0 ? 15 : -15), p.x],
            y: [p.y, p.y + (i % 2 === 0 ? -15 : 15), p.y]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
          className={`absolute w-${p.size} h-${p.size} rounded-full ${p.color} blur-[2px] hidden md:block`}
          style={{ 
            width: `${p.size}px`, 
            height: `${p.size}px`,
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
          }}
        />
      ))}

      {/* Floating Product Capability Cards (Left & Right background decoration) */}
      <div className="absolute left-6 lg:left-24 top-1/4 hidden xl:block pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 0.35, x: 0, y: [0, -10, 0] }}
          transition={{ 
            x: { duration: 1, delay: 0.4 },
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="glass-panel p-4 rounded-xl border border-cyber-blue/20 w-52 flex flex-col gap-2 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyber-blue/15 flex items-center justify-center">
              <Dumbbell className="w-3.5 h-3.5 text-cyber-blue" />
            </div>
            <span className="text-[9px] font-mono text-white tracking-widest uppercase">Workout Matrix</span>
          </div>
          <span className="text-[8px] font-mono text-gray-500">// HYPERTROPHY FOCUS //</span>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyber-blue w-[85%] rounded-full" />
          </div>
        </motion.div>
      </div>

      <div className="absolute right-6 lg:right-24 bottom-1/4 hidden xl:block pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 0.35, x: 0, y: [0, 10, 0] }}
          transition={{ 
            x: { duration: 1, delay: 0.6 },
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }
          }}
          className="glass-panel p-4 rounded-xl border border-neon-green/20 w-52 flex flex-col gap-2 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-neon-green/15 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-neon-green" />
            </div>
            <span className="text-[9px] font-mono text-white tracking-widest uppercase">Nutrition Core</span>
          </div>
          <span className="text-[8px] font-mono text-gray-500">// FUEL COEFFICIENT //</span>
          <span className="text-xs font-mono font-bold text-neon-green">2,850 KCAL / DAY</span>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto w-full z-10 flex flex-col items-center">
        <motion.div
          variants={containerVars}
          initial="initial"
          animate="animate"
          className="w-full glass-panel p-8 sm:p-12 md:p-16 rounded-3xl border border-white/10 shadow-2xl relative flex flex-col items-center text-center gap-8 overflow-hidden"
        >
          {/* Animated Glow Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/10 via-transparent to-neon-green/10 opacity-50 pointer-events-none" />
          <div className="absolute -top-px left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyber-blue/50 to-transparent" />
          <div className="absolute -bottom-px left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-neon-green/50 to-transparent" />

          {/* Tag */}
          <motion.div variants={itemVars} className="flex justify-center">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase bg-gradient-to-r from-cyber-blue via-white to-neon-green bg-clip-text text-transparent px-4 py-1.5 rounded-full border border-white/5 glass-panel">
              // METAMORPHOSIS INITIATION //
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2 
            variants={itemVars}
            className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight text-white leading-[0.95]"
          >
            Ready To Build Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-white to-neon-green">
              Strongest Version?
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p 
            variants={itemVars}
            className="text-sm sm:text-base text-gray-400 font-sans font-light max-w-xl mx-auto leading-relaxed"
          >
            Join FitForge and receive your personalized AI workout plan, nutrition strategy, and transformation roadmap in minutes.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            variants={itemVars}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4 w-full sm:w-auto"
          >
            {/* Massive Futuristic Primary Button */}
            <Link
              href="/sign-up"
              data-cursor-text="JOIN NOW"
              className="relative group px-10 py-5 w-full sm:w-auto bg-gradient-to-r from-cyber-blue via-cyan-400 to-neon-green text-black font-bold text-xs tracking-widest uppercase rounded-lg shadow-lg hover:shadow-neon-green/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 pointer-events-auto flex items-center justify-center gap-2 overflow-hidden"
            >
              {/* Dynamic Glow Overlay */}
              <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span>Create Free Account</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Glassmorphic Secondary Button */}
            <Link
              href="/sign-in"
              data-cursor-text="LOGIN"
              className="px-10 py-5 w-full sm:w-auto border border-white/10 glass-panel hover:bg-white/5 hover:border-white/20 hover:scale-[1.01] active:scale-[0.99] text-white font-semibold text-xs tracking-widest uppercase rounded-lg transition-all duration-300 pointer-events-auto flex items-center justify-center gap-2"
            >
              <span>Login</span>
            </Link>
          </motion.div>

          {/* Security / Data Badge */}
          <motion.div 
            variants={itemVars}
            className="flex items-center gap-2 mt-4 font-mono text-[9px] text-gray-500 tracking-widest border-t border-white/5 pt-6 w-full justify-center"
          >
            <Shield className="w-3.5 h-3.5 text-cyber-blue" />
            <span>SECURED METABOLIC ENCRYPTION PROTOCOL ACTIVE</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
