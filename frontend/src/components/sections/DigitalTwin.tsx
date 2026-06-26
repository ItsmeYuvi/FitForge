'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Cpu, Zap, CircleAlert, EyeOff } from 'lucide-react';

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

interface DigitalTwinProps {
  profile?: any;
}

export default function DigitalTwin({ profile }: DigitalTwinProps) {
  const [activePhase, setActivePhase] = useState<number>(0);
  const [phases, setPhases] = useState<PredictionPhase[]>([]);

  const activeProfile = profile || {
    age: 26,
    gender: 'male',
    height: 182,
    weight: 84,
    activityLevel: 'moderate',
    goal: 'lose_fat',
  };

  useEffect(() => {
    if (activeProfile) {
      // Calculate realistic projections dynamically from their real biometrics!
      const heightM = activeProfile.height / 100;
      const initialBmi = activeProfile.weight / (heightM * heightM);
      const isMale = activeProfile.gender === 'male';
      
      const bmrVal = isMale 
        ? Math.round(10 * activeProfile.weight + 6.25 * activeProfile.height - 5 * activeProfile.age + 5)
        : Math.round(10 * activeProfile.weight + 6.25 * activeProfile.height - 5 * activeProfile.age - 161);

      let initialFat = isMale 
        ? (1.20 * initialBmi + 0.23 * activeProfile.age - 16.2)
        : (1.20 * initialBmi + 0.23 * activeProfile.age - 5.4);
      initialFat = Math.max(4, initialFat);

      const computedPhases: PredictionPhase[] = [];
      let currentWeight = activeProfile.weight;
      let currentFat = initialFat;

      const milestones = [
        { day: 0, title: 'GENESIS STATUS', status: 'Establishing biological baseline and training capacity index.' },
        { day: 30, title: 'PHASE ALPHA (ADAPTATION)', status: 'Primary metabolic shift. Body adapts to structural load.' },
        { day: 60, title: 'PHASE BETA (SYNTHESIS)', status: 'Hypertrophic and lipid-clearing synthesis. Performance curves peak.' },
        { day: 90, title: 'PHASE OMEGA (TRANSCEND)', status: 'Optimized digital twin target unlocked. Reprogrammed physical form.' }
      ];

      milestones.forEach((m, idx) => {
        if (idx > 0) {
          if (activeProfile.goal === 'lose_fat') {
            currentWeight -= 1.8;
            currentFat -= 1.0;
          } else if (activeProfile.goal === 'build_muscle') {
            currentWeight += 1.0;
            currentFat += 0.2;
          } else {
            currentWeight -= 0.5;
            currentFat -= 0.6;
          }
        }

        const currentMuscle = currentWeight * (1 - currentFat / 100);

        computedPhases.push({
          day: m.day,
          phaseName: m.title,
          weight: `${currentWeight.toFixed(1)} kg`,
          bodyFat: `${Math.max(3, currentFat).toFixed(1)} %`,
          muscleMass: `${currentMuscle.toFixed(1)} kg`,
          metabolism: `${Math.round(bmrVal + (idx * 50))} kcal`,
          status: m.status,
          highlights: idx === 0 
            ? ['Caloric baseline locked', 'Metabolic stabilization active', 'Neuromuscular calibration prep']
            : idx === 1
            ? ['Lipid oxidation triggered', 'Glycogen reserves optimized', 'VO2 Max index +4.8%']
            : idx === 2
            ? ['Myofibrillar hypertrophy active', 'Visceral fat reduction', 'Systemic recovery coefficient peak']
            : ['New homeostatic set-point', 'Lactate threshold +12%', 'Metabolic age shift: -4 years']
        });
      });

      setPhases(computedPhases);
    }
  }, [profile]);

  // Coordinate paths mapping for the SVG graphs
  // Maps calculations dynamically
  let weightPoints = "0,120 100,105 200,90 300,75";
  let bodyFatPoints = "0,90 100,75 200,55 300,30";

  if (phases.length > 0) {
    const minW = Math.min(...phases.map(p => parseFloat(p.weight)));
    const maxW = Math.max(...phases.map(p => parseFloat(p.weight)));
    const wRange = maxW - minW || 1;

    const minF = Math.min(...phases.map(p => parseFloat(p.bodyFat)));
    const maxF = Math.max(...phases.map(p => parseFloat(p.bodyFat)));
    const fRange = maxF - minF || 1;

    weightPoints = phases.map((p, idx) => {
      const x = idx * 100;
      const y = 110 - ((parseFloat(p.weight) - minW) / wRange) * 80;
      return `${x},${y}`;
    }).join(' ');

    bodyFatPoints = phases.map((p, idx) => {
      const x = idx * 100;
      const y = 110 - ((parseFloat(p.bodyFat) - minF) / fRange) * 80;
      return `${x},${y}`;
    }).join(' ');
  }

  return (
    <section className="relative w-full h-screen snap-start snap-always py-24 px-6 sm:px-12 md:px-24 flex items-center justify-center overflow-hidden z-20 shrink-0 select-none">
      <div className="max-w-7xl mx-auto w-full z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-12">
          <span className="text-xs font-mono tracking-widest text-cyber-blue uppercase flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-cyber-blue" />
            SECTION 03 // AI WORKOUT GENERATION
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-none">
            Your Personalized Training System
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-xl">
            Our AI instantly generates a complete workout strategy tailored to your goals. Whether you're building muscle, losing fat, or transforming your physique, every exercise, set, rep, and progression strategy is customized for you.
          </p>
        </div>

        {phases.length > 0 ? (
          /* Live Calibrated Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Column 1: Phase Selector Cards */}
            <div className="flex flex-col gap-4">
              {phases.map((phase, idx) => (
                <button
                  key={phase.day}
                  onClick={() => setActivePhase(idx)}
                  data-cursor-text="PREDICT"
                  className={`interactive-card text-left p-4 rounded-xl border transition-all duration-300 pointer-events-auto flex items-center justify-between ${
                    activePhase === idx
                      ? 'glass-panel-glow-green border-neon-green/40 shadow-neon-green/10'
                      : 'glass-panel border-white/5 opacity-60 hover:opacity-100 hover:border-white/10'
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-mono text-neon-green tracking-widest block mb-1">
                      {phase.day === 0 ? 'START' : `DAY ${phase.day}`}
                    </span>
                    <h3 className="text-xs font-semibold text-white tracking-wide">{phase.phaseName}</h3>
                  </div>
                  <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center font-mono text-[9px] text-gray-400">
                    {phase.day === 0 ? '00' : `0${idx}`}
                  </div>
                </button>
              ))}
            </div>

            {/* Column 2 & 3 Combined: Detailed Twin Analytics Panel */}
            <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 relative flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhase}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col justify-between gap-6 z-10"
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                        SIMULATION METRICS RANGE
                      </span>
                      <h3 className="text-xl font-bold tracking-tight text-white mt-1">
                        {phases[activePhase].phaseName}
                      </h3>
                    </div>
                    <div className="flex gap-4">
                      <div className="glass-panel px-3 py-1.5 rounded-lg border border-white/5 text-center min-w-[70px]">
                        <span className="text-[7px] font-mono text-gray-500 uppercase block">FAT %</span>
                        <span className="text-base font-mono font-bold text-cyber-blue">{phases[activePhase].bodyFat}</span>
                      </div>
                      <div className="glass-panel px-3 py-1.5 rounded-lg border border-white/5 text-center min-w-[70px]">
                        <span className="text-[7px] font-mono text-gray-500 uppercase block">MUSCLE</span>
                        <span className="text-base font-mono font-bold text-neon-green">{phases[activePhase].muscleMass}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                    <Cpu className="w-4 h-4 text-neon-green mt-0.5 animate-pulse shrink-0" />
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 block mb-0.5">METAMORPHOSIS STATUS</span>
                      <p className="text-[11px] text-gray-300 leading-normal font-light">
                        {phases[activePhase].status}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    
                    {/* SVG Line Graph */}
                    <div className="glass-panel p-4 rounded-xl border border-white/5 relative">
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-2">
                        90-DAY METAMORPHOSIS SLOPES
                      </span>
                      
                      <div className="w-full h-24 relative">
                        <svg className="w-full h-full" viewBox="0 0 300 120">
                          <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          
                          <polyline fill="none" stroke="#39ff14" strokeWidth="2" points={weightPoints} className="opacity-80" />
                          <polyline fill="none" stroke="#00f0ff" strokeWidth="2" points={bodyFatPoints} className="opacity-80" />

                          {[0, 100, 200, 300].map((cx, idx) => (
                            <circle
                              key={idx}
                              cx={cx}
                              cy={idx === 0 ? 30 : idx === 1 ? 55 : idx === 2 ? 75 : 95}
                              r={activePhase === idx ? 4.5 : 3}
                              fill={activePhase === idx ? '#39ff14' : '#1e3a1e'}
                              stroke="#030303"
                              strokeWidth="1"
                            />
                          ))}
                        </svg>
                      </div>

                      <div className="flex justify-between items-center mt-2 font-mono text-[7px] text-gray-500 uppercase">
                        <span>DAY 0</span>
                        <span>DAY 30</span>
                        <span>DAY 60</span>
                        <span>DAY 90</span>
                      </div>
                    </div>

                    {/* Bullet Highlights */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">
                        SYSTEM PREDICTION HIGHLIGHTS
                      </span>
                      <div className="flex flex-col gap-2">
                        {phases[activePhase].highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-300 font-light">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 mt-2 font-mono">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Zap className="w-3.5 h-3.5 text-cyber-blue" />
                          <span className="font-bold text-white">{phases[activePhase].metabolism}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 uppercase">DAILY IDLE ENERGY</span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        ) : (
          /* Empty Calibration state */
          <div className="w-full glass-panel p-12 rounded-2xl border border-dashed border-cyber-blue/30 flex flex-col items-center justify-center text-center gap-4 py-20 pointer-events-auto">
            <div className="w-12 h-12 rounded-full bg-cyber-blue/5 border border-cyber-blue/20 flex items-center justify-center animate-pulse">
              <EyeOff className="w-5 h-5 text-cyber-blue" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-white tracking-widest uppercase">
                CALIBRATION SIMULATOR OFFLINE
              </h3>
              <p className="text-xs text-gray-400 font-light max-w-sm mt-2 mx-auto leading-relaxed">
                No active biometric metrics detected. Transmit your parameters via the Metamorphosis generator below to initialize your digital physical twin.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
