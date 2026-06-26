'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserCheck, Flame, Scale, TrendingUp } from 'lucide-react';

interface CaseStudy {
  subject: string;
  name: string;
  age: number;
  goal: string;
  before: {
    weight: string;
    bodyFat: string;
    muscleMass: string;
  };
  after: {
    weight: string;
    bodyFat: string;
    muscleMass: string;
  };
  synthesis: string;
}

export default function SocialProof() {
  const [activeSubject, setActiveSubject] = useState<number>(0);

  const cases: CaseStudy[] = [
    {
      subject: 'SUBJECT_ALPHA',
      name: 'Ethan Roberts',
      age: 28,
      goal: 'Deficit / Fat Shred',
      before: {
        weight: '89.2 kg',
        bodyFat: '23.4 %',
        muscleMass: '64.5 kg',
      },
      after: {
        weight: '77.8 kg',
        bodyFat: '10.8 %',
        muscleMass: '65.2 kg',
      },
      synthesis: 'Core AI engine dynamically reduced daily carb limit as his metabolic adaptation set in. System maintained muscle protein synthesis levels by cycling amino acids on high-intensity training days.',
    },
    {
      subject: 'SUBJECT_BETA',
      name: 'Marcus Kael',
      age: 34,
      goal: 'Hypertrophy / Lean Bulk',
      before: {
        weight: '72.0 kg',
        bodyFat: '9.5 %',
        muscleMass: '62.1 kg',
      },
      after: {
        weight: '81.4 kg',
        bodyFat: '11.8 %',
        muscleMass: '67.6 kg',
      },
      synthesis: 'Optimized training frequency centered on heavy shoulder/back overload. The system built customized caloric surplus ceilings to prevent excessive visceral fat gain during metabolic cycles.',
    },
    {
      subject: 'SUBJECT_GAMMA',
      name: 'Sarah Lin',
      age: 26,
      goal: 'Body Recomposition',
      before: {
        weight: '65.4 kg',
        bodyFat: '27.2 %',
        muscleMass: '45.1 kg',
      },
      after: {
        weight: '59.8 kg',
        bodyFat: '16.5 %',
        muscleMass: '47.4 kg',
      },
      synthesis: 'Structured glycogen reloading windows post-workout. Core neural planner shifted metabolic index to active-lean state, correcting hormonal lethargy while maintaining steady strength metrics.',
    },
  ];

  return (
    <section className="relative w-full h-screen snap-start snap-always py-24 px-6 sm:px-12 md:px-24 flex items-center justify-center overflow-hidden z-20 shrink-0 select-none">
      <div className="max-w-7xl mx-auto w-full z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-16 text-center items-center">
          <span className="text-xs font-mono tracking-widest text-neon-green uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neon-green" />
            SECTION 07 // TRANSFORMATION ENGINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-none">
            Track Your Evolution
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-lg">
            Log your progress, compare milestones, and watch your transformation unfold through intelligent progress tracking and predictive analytics.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex justify-center gap-4 mb-12">
          {cases.map((cs, idx) => (
            <button
              key={cs.subject}
              onClick={() => setActiveSubject(idx)}
              data-cursor-text="INSPECT"
              className={`px-6 py-3 rounded-lg border font-mono text-[10px] uppercase tracking-wider pointer-events-auto transition-all duration-300 ${
                activeSubject === idx
                  ? 'bg-white/5 border-neon-green/45 text-white shadow-lg shadow-neon-green/5'
                  : 'border-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {cs.subject}
            </button>
          ))}
        </div>

        {/* Transformation Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubject}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch"
          >
            {/* Left Side: Before / After split */}
            <div className="flex flex-col gap-6 justify-between">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 relative flex-1 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-gray-500 tracking-wider block mb-4">
                  GENESIS STATE (DAY 00)
                </span>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                    <Scale className="w-4 h-4 text-cyber-blue mx-auto mb-2" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">WEIGHT</span>
                    <span className="text-base font-mono font-bold text-white">{cases[activeSubject].before.weight}</span>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                    <TrendingUp className="w-4 h-4 text-cyber-blue mx-auto mb-2" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">BODY FAT</span>
                    <span className="text-base font-mono font-bold text-white">{cases[activeSubject].before.bodyFat}</span>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                    <UserCheck className="w-4 h-4 text-cyber-blue mx-auto mb-2" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">MUSCLE</span>
                    <span className="text-base font-mono font-bold text-white">{cases[activeSubject].before.muscleMass}</span>
                  </div>
                </div>
              </div>

              {/* Glowing Arrow Indicator */}
              <div className="flex justify-center items-center text-neon-green animate-pulse font-mono text-xs">
                ▼ METAMORPHOSIS PROCESS ACCELERATED ▼
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-neon-green/20 relative flex-1 flex flex-col justify-between shadow-lg shadow-neon-green/5">
                <span className="text-[10px] font-mono text-neon-green tracking-wider block mb-4">
                  METAMORPHIC COMPILATION (DAY 90)
                </span>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                    <Scale className="w-4 h-4 text-neon-green mx-auto mb-2" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">WEIGHT</span>
                    <span className="text-base font-mono font-bold text-white">{cases[activeSubject].after.weight}</span>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                    <TrendingUp className="w-4 h-4 text-neon-green mx-auto mb-2" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">BODY FAT</span>
                    <span className="text-base font-mono font-bold text-white">{cases[activeSubject].after.bodyFat}</span>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                    <UserCheck className="w-4 h-4 text-neon-green mx-auto mb-2" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">MUSCLE</span>
                    <span className="text-base font-mono font-bold text-white">{cases[activeSubject].after.muscleMass}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Case synthesis details */}
            <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />

              <div className="z-10 flex flex-col gap-6">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
                    CASE DOSSIER DETAILS
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                    {cases[activeSubject].name}
                  </h3>
                  <span className="text-[9px] font-mono text-gray-400">
                    Age: {cases[activeSubject].age} // Class: {cases[activeSubject].goal}
                  </span>
                </div>

                <div className="h-[1px] bg-white/5 w-full" />

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-neon-green uppercase block">AI CLINICAL SYNTHESIS</span>
                  <p className="text-sm text-gray-300 font-light leading-relaxed">
                    {cases[activeSubject].synthesis}
                  </p>
                </div>
              </div>

              <div className="z-10 bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3 mt-6">
                <Flame className="w-5 h-5 text-neon-green shrink-0 animate-bounce" />
                <span className="text-[10px] font-mono text-gray-400 leading-normal">
                  Metabolic acceleration coefficient calculated at 1.48x baseline speed. Zero muscle wasting logs noted.
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
