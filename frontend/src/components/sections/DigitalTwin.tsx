'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Cpu, Zap, Flame } from 'lucide-react';

interface PredictionPhase {
  day: number;
  phaseName: string;
  weight: string;
  bodyFat: string;
  muscleMass: string;
  metabolism: string;
  status: string;
  highlights: string[];
}

export default function DigitalTwin() {
  const [activePhase, setActivePhase] = useState<number>(0);

  const phases: PredictionPhase[] = [
    {
      day: 0,
      phaseName: 'GENESIS STATUS',
      weight: '78.5 kg',
      bodyFat: '14.8 %',
      muscleMass: '63.2 kg',
      metabolism: '1,840 kcal',
      status: 'Establishing biological baseline and training capacity index.',
      highlights: ['Caloric baseline locked', 'Resting metabolic stabilization', 'Neuromuscular activation prep'],
    },
    {
      day: 30,
      phaseName: 'PHASE ALPHA (ADAPTATION)',
      weight: '76.8 kg',
      bodyFat: '13.9 %',
      muscleMass: '63.6 kg',
      metabolism: '1,890 kcal',
      status: 'Primary metabolic shift. Body adapts to structural load and nutritional ratios.',
      highlights: ['Lipid oxidation triggered', 'Glycogen reserves optimized', 'Vo2 Max index +4.8%'],
    },
    {
      day: 60,
      phaseName: 'PHASE BETA (SYNTHESIS)',
      weight: '75.2 kg',
      bodyFat: '12.8 %',
      muscleMass: '64.1 kg',
      metabolism: '1,930 kcal',
      status: 'Hypertrophic and lipid-clearing synthesis. Exponential power curves achieved.',
      highlights: ['Myofibrillar hypertrophy', 'Visceral fat reduction', 'Systemic recovery coefficient peak'],
    },
    {
      day: 90,
      phaseName: 'PHASE OMEGA (TRANSCEND)',
      weight: '73.8 kg',
      bodyFat: '11.5 %',
      muscleMass: '64.8 kg',
      metabolism: '1,990 kcal',
      status: 'Optimized digital twin target form unlocked. Fully reprogrammed performance index.',
      highlights: ['New baseline homeostatic set-point', 'Lactate threshold +12%', 'Metabolic age shift: -4 years'],
    },
  ];

  // SVG Chart points calculations
  const weightPoints = "0,120 100,105 200,90 300,75";
  const bodyFatPoints = "0,90 100,75 200,55 300,30";
  const musclePoints = "0,30 100,45 200,65 300,85";

  return (
    <section className="relative w-full min-h-screen py-24 px-6 sm:px-12 md:px-24 flex flex-col justify-center z-20">
      <div className="max-w-7xl mx-auto w-full z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-16">
          <span className="text-xs font-mono tracking-widest text-neon-green uppercase flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-neon-green animate-pulse" />
            SECTION 03 // PREDICTIVE DIGITAL TWIN
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-none">
            The Digital Twin Simulation
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-xl">
            Simulate your physical evolution through our bio-predictive model. By synthesizing structural loads, hormone curves, and metabolic indices, FitForge builds your future physical form in the digital sandbox.
          </p>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Column 1: Phase Selector Cards */}
          <div className="flex flex-col gap-4">
            {phases.map((phase, idx) => (
              <button
                key={phase.day}
                onClick={() => setActivePhase(idx)}
                data-cursor-text="PREDICT"
                className={`interactive-card text-left p-5 rounded-xl border transition-all duration-300 pointer-events-auto flex items-center justify-between ${
                  activePhase === idx
                    ? 'glass-panel-glow-green border-neon-green/40 shadow-neon-green/10'
                    : 'glass-panel border-white/5 opacity-60 hover:opacity-100 hover:border-white/10'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-neon-green tracking-widest block mb-1">
                    {phase.day === 0 ? 'START' : `DAY ${phase.day}`}
                  </span>
                  <h3 className="text-sm font-semibold text-white tracking-wide">{phase.phaseName}</h3>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-mono text-[10px] text-gray-400">
                  {phase.day === 0 ? '00' : `0${idx}`}
                </div>
              </button>
            ))}
          </div>

          {/* Column 2 & 3 Combined: Detailed Twin Analytics Panel */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-white/5 relative flex flex-col justify-between overflow-hidden">
            {/* Background Cyber Grid */}
            <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col justify-between gap-8 z-10"
              >
                {/* Header Metrics */}
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
                      SIMULATION METRICS RANGE
                    </span>
                    <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                      {phases[activePhase].phaseName}
                    </h3>
                  </div>
                  <div className="flex gap-4">
                    <div className="glass-panel px-4 py-2 rounded-lg border border-white/5 text-center min-w-[70px]">
                      <span className="text-[8px] font-mono text-gray-500 uppercase block">FAT LEVEL</span>
                      <span className="text-lg font-mono font-bold text-cyber-blue">{phases[activePhase].bodyFat}</span>
                    </div>
                    <div className="glass-panel px-4 py-2 rounded-lg border border-white/5 text-center min-w-[70px]">
                      <span className="text-[8px] font-mono text-gray-500 uppercase block">MUSCLE</span>
                      <span className="text-lg font-mono font-bold text-neon-green">{phases[activePhase].muscleMass}</span>
                    </div>
                  </div>
                </div>

                {/* Simulation Description */}
                <div className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                  <Cpu className="w-5 h-5 text-neon-green mt-0.5 animate-pulse shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block mb-1">METAMORPHOSIS STATUS</span>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                      {phases[activePhase].status}
                    </p>
                  </div>
                </div>

                {/* Sub-grid of graphs and details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Floating Chart panel */}
                  <div className="glass-panel p-5 rounded-xl border border-white/5 relative">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-4">
                      90-DAY METAMORPHOSIS SLOPES
                    </span>
                    
                    {/* SVG Line Graph */}
                    <div className="w-full h-32 relative">
                      <svg className="w-full h-full" viewBox="0 0 300 150">
                        {/* Grid lines */}
                        <line x1="0" y1="37" x2="300" y2="37" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="112" x2="300" y2="112" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        
                        {/* Muscle Growth Line (Neon Green) */}
                        <polyline
                          fill="none"
                          stroke="#39ff14"
                          strokeWidth="2.5"
                          points={musclePoints}
                          className="opacity-80"
                        />
                        {/* Lipid Decline Line (Cyber Blue) */}
                        <polyline
                          fill="none"
                          stroke="#00f0ff"
                          strokeWidth="2.5"
                          points={bodyFatPoints}
                          className="opacity-80"
                        />

                        {/* Interactive dots representing phase steps */}
                        {[0, 100, 200, 300].map((cx, idx) => (
                          <circle
                            key={idx}
                            cx={cx}
                            cy={idx === 0 ? 30 : idx === 1 ? 45 : idx === 2 ? 65 : 85}
                            r={activePhase === idx ? 5 : 3.5}
                            fill={activePhase === idx ? '#39ff14' : '#1e3a1e'}
                            stroke="#030303"
                            strokeWidth="1.5"
                          />
                        ))}
                      </svg>
                    </div>

                    <div className="flex justify-between items-center mt-3 font-mono text-[8px] text-gray-500 uppercase">
                      <span>DAY 0</span>
                      <span>DAY 30</span>
                      <span>DAY 60</span>
                      <span>DAY 90</span>
                    </div>

                    {/* Chart Legends */}
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-neon-green" />
                        <span className="text-[8px] font-mono text-gray-400">LEAN MUSCLE GROWTH</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-cyber-blue" />
                        <span className="text-[8px] font-mono text-gray-400">BODY FAT REDUCTION</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                      SYSTEM PREDICTION HIGHLIGHTS
                    </span>
                    <div className="flex flex-col gap-3">
                      {phases[activePhase].highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                          <span className="text-xs text-gray-300 font-light">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-4 font-mono">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-cyber-blue" />
                        <span className="text-xs font-bold text-white">{phases[activePhase].metabolism}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase">DAILY IDLE ENERGY</span>
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
