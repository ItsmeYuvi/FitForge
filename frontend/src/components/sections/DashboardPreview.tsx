'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, CheckCircle, Flame, Dumbbell, Trophy } from 'lucide-react';

export default function DashboardPreview() {
  const [chartTab, setChartTab] = useState<'strength' | 'weight'>('strength');

  const strengthPoints = "0,110 50,105 100,90 150,85 200,60 250,55 300,30 350,25";
  const weightPoints = "0,30 50,45 100,60 150,70 200,85 250,90 300,105 350,115";

  return (
    <section id="dashboard-preview" className="relative w-full min-h-screen py-24 px-6 sm:px-12 md:px-24 flex flex-col justify-center z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-16">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono tracking-widest text-cyber-blue uppercase">
              SECTION 06 // SYSTEM TERMINAL PREVIEW
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-none">
              The Metamorphosis Terminal
            </h2>
            <p className="text-sm text-gray-400 font-light max-w-lg">
              Analyze metrics, log lifts, monitor sleep coefficients, and watch your physical twin model adapt in real-time as you complete daily tasks.
            </p>
          </div>
          
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-lg border border-white/5">
            <button
              onClick={() => setChartTab('strength')}
              data-cursor-text="TOGGLE"
              className={`px-4 py-2 font-mono text-[10px] uppercase rounded-md tracking-wider transition-all duration-300 pointer-events-auto ${
                chartTab === 'strength' ? 'bg-cyber-blue text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Strength Growth
            </button>
            <button
              onClick={() => setChartTab('weight')}
              data-cursor-text="TOGGLE"
              className={`px-4 py-2 font-mono text-[10px] uppercase rounded-md tracking-wider transition-all duration-300 pointer-events-auto ${
                chartTab === 'weight' ? 'bg-cyber-blue text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Weight Trends
            </button>
          </div>
        </div>

        {/* Dashboard Grid Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Main Visualizer Panel (Cols 1 & 2) */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[450px] relative overflow-hidden">
            <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />

            {/* Top Info bar */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse" />
                <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">
                  SIMULATED BIO-GRAPH
                </span>
              </div>
              <span className="font-mono text-[9px] text-gray-500">SCALE: 12 WEEKS</span>
            </div>

            {/* Line graph canvas block */}
            <div className="flex-1 flex items-center justify-center py-8 z-10">
              <div className="w-full h-48 relative">
                <AnimatePresence mode="wait">
                  <motion.svg
                    key={chartTab}
                    initial={{ opacity: 0, scaleY: 0.8 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0.8 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full"
                    viewBox="0 0 350 150"
                  >
                    {/* Horizontal Grid guidelines */}
                    <line x1="0" y1="30" x2="350" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="0" y1="75" x2="350" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="0" y1="120" x2="350" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                    <polyline
                      fill="none"
                      stroke={chartTab === 'strength' ? '#39ff14' : '#00f0ff'}
                      strokeWidth="3"
                      points={chartTab === 'strength' ? strengthPoints : weightPoints}
                      className="opacity-90"
                    />

                    {/* Chart points */}
                    {(chartTab === 'strength' ? [110, 105, 90, 85, 60, 55, 30, 25] : [30, 45, 60, 70, 85, 90, 105, 115]).map((yVal, idx) => (
                      <circle
                        key={idx}
                        cx={idx * 50}
                        cy={yVal}
                        r="4"
                        fill={chartTab === 'strength' ? '#39ff14' : '#00f0ff'}
                        stroke="#030303"
                        strokeWidth="2"
                      />
                    ))}
                  </motion.svg>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom axis descriptions */}
            <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-4 font-mono text-[9px] text-gray-500 z-10">
              <span>WEEK 1</span>
              <span>WEEK 3</span>
              <span>WEEK 6</span>
              <span>WEEK 9</span>
              <span>WEEK 12</span>
            </div>
          </div>

          {/* Right Column: Statistics Widgets */}
          <div className="flex flex-col gap-6 justify-between">
            
            {/* Widget 1: Completion Rate Circle */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                  WORKOUT COMPLETION RATE
                </span>
                <span className="text-3xl font-mono font-black text-white">88.4%</span>
                <p className="text-[10px] text-gray-400 font-light max-w-[150px]">
                  5 out of 6 sessions completed this week. Progressive overload target on track.
                </p>
              </div>

              {/* Glowing SVG radial ring */}
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#39ff14"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 * (1 - 0.884)}
                    className="opacity-90 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white">
                  88%
                </div>
              </div>
            </div>

            {/* Widget 2: Nutrition tracker */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                NUTRITIONAL ADHERENCE
              </span>

              <div className="flex flex-col gap-3">
                {/* Micro progress-bars */}
                {[
                  { label: 'PROTEIN TARGET', percent: 96, color: 'bg-neon-green' },
                  { label: 'CARBOHYDRATE LIMIT', percent: 91, color: 'bg-cyber-blue' },
                  { label: 'LIPID TARGET', percent: 84, color: 'bg-cyber-blue' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between font-mono text-[9px] text-gray-400">
                      <span>{item.label}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 3: Mini accomplishments */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-cyber-blue animate-bounce" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-neon-green uppercase tracking-widest block">
                  MILESTONE REACHED
                </span>
                <span className="text-xs font-bold text-white block">Hypertrophy Index +12%</span>
                <span className="text-[9px] text-gray-500 font-mono">1.2x metabolic acceleration rate</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
