'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, CheckCircle, Flame, Dumbbell, Trophy, EyeOff, AlertTriangle } from 'lucide-react';

interface DashboardPreviewProps {
  weeklyReview?: any;
  measurements?: any[];
}

export default function DashboardPreview({ weeklyReview, measurements }: DashboardPreviewProps) {
  const [chartTab, setChartTab] = useState<'strength' | 'weight'>('weight');

  const activeWeeklyReview = weeklyReview || {
    workoutConsistencyScore: 92,
    nutritionConsistencyScore: 88,
  };

  const activeMeasurements = measurements && measurements.length > 1 ? measurements : [
    { weight: 84.0, date: 'Week 1' },
    { weight: 83.2, date: 'Week 2' },
    { weight: 82.5, date: 'Week 3' },
    { weight: 81.9, date: 'Week 4' },
    { weight: 81.1, date: 'Week 5' },
    { weight: 80.4, date: 'Week 6' },
    { weight: 79.8, date: 'Week 7' },
    { weight: 79.2, date: 'Week 8' },
  ];

  // Hardcode conceptual standard strength growth path, but make weight logs strictly dynamic!
  const strengthPoints = "0,110 50,105 100,90 150,85 200,60 250,55 300,30 350,25";
  
  let weightPoints = "";
  let weightPointsArray: number[] = [];
  
  const hasLogs = activeMeasurements && activeMeasurements.length > 1;

  if (hasLogs) {
    // Map actual user weight logs to SVG plot points (0 to 350 on X, 20 to 130 on Y)
    const recentLogs = [...activeMeasurements].reverse().slice(-8); // take last 8 logs
    const minW = Math.min(...recentLogs.map(m => m.weight));
    const maxW = Math.max(...recentLogs.map(m => m.weight));
    const wRange = maxW - minW || 1;

    weightPointsArray = recentLogs.map(m => m.weight);

    weightPoints = recentLogs.map((log, idx) => {
      const x = idx * 50;
      // Invert Y coordinate
      const y = 120 - ((log.weight - minW) / wRange) * 80;
      return `${x},${y}`;
    }).join(' ');
  }

  // Active workout consistency from weekly review DB
  const completionRate = activeWeeklyReview ? activeWeeklyReview.workoutConsistencyScore : null;
  const nutritionRate = activeWeeklyReview ? activeWeeklyReview.nutritionConsistencyScore : null;

  return (
    <section className="relative w-full h-screen snap-start snap-always py-24 px-6 sm:px-12 md:px-24 flex items-center justify-center overflow-hidden z-20 shrink-0 select-none">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono tracking-widest text-cyber-blue uppercase">
              SECTION 06 // PERFORMANCE DASHBOARD
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-none">
              Your Command Center
            </h2>
            <p className="text-sm text-gray-400 font-light max-w-lg">
              Track workouts, monitor body metrics, maintain streaks, analyze progress, and receive weekly AI insights from one powerful dashboard.
            </p>
          </div>
          
          {activeWeeklyReview && hasLogs && (
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-lg border border-white/5 font-mono text-[9px]">
              <button
                onClick={() => setChartTab('strength')}
                className={`px-3 py-1.5 uppercase rounded tracking-wider transition-all duration-200 pointer-events-auto ${
                  chartTab === 'strength' ? 'bg-cyber-blue text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Strength splits
              </button>
              <button
                onClick={() => setChartTab('weight')}
                className={`px-3 py-1.5 uppercase rounded tracking-wider transition-all duration-200 pointer-events-auto ${
                  chartTab === 'weight' ? 'bg-cyber-blue text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Weight Logs
              </button>
            </div>
          )}
        </div>

        {activeWeeklyReview && hasLogs ? (
          /* Live Terminal Dashboard preview */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Main Visualizer Panel */}
            <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
              <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />

              <div className="flex justify-between items-center z-10 font-mono text-[9px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-gray-400 tracking-widest uppercase">
                    LIVE BIO-METRIC GRAPH
                  </span>
                </div>
                <span className="text-gray-500">SCALE: LAST 8 LOGS</span>
              </div>

              <div className="flex-1 flex items-center justify-center py-6 z-10">
                <div className="w-full h-36 relative">
                  <AnimatePresence mode="wait">
                    <motion.svg
                      key={chartTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full"
                      viewBox="0 0 350 140"
                    >
                      <line x1="0" y1="30" x2="350" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="70" x2="350" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="110" x2="350" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                      <polyline
                        fill="none"
                        stroke={chartTab === 'strength' ? '#39ff14' : '#00f0ff'}
                        strokeWidth="2.5"
                        points={chartTab === 'strength' ? strengthPoints : weightPoints}
                        className="opacity-90"
                      />

                      {(chartTab === 'strength' ? [110, 105, 90, 85, 60, 55, 30, 25] : weightPointsArray.map((w, idx) => {
                        const min = Math.min(...weightPointsArray);
                        const max = Math.max(...weightPointsArray);
                        const range = max - min || 1;
                        return 120 - ((w - min) / range) * 80;
                      })).map((yVal, idx) => (
                        <circle
                          key={idx}
                          cx={idx * 50}
                          cy={yVal}
                          r="3.5"
                          fill={chartTab === 'strength' ? '#39ff14' : '#00f0ff'}
                          stroke="#030303"
                          strokeWidth="1.5"
                        />
                      ))}
                    </motion.svg>
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-3 font-mono text-[8px] text-gray-500 z-10">
                <span>START INTERVAL</span>
                <span>DATA INTEGRITY VERIFIED</span>
                <span>LATEST LOG</span>
              </div>
            </div>

            {/* Right Column: Statistics Widgets */}
            <div className="flex flex-col gap-4 justify-between">
              
              {/* Completion Rate Circle */}
              {completionRate !== null && (
                <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">
                      WORKOUT STREAK RATE
                    </span>
                    <span className="text-2xl font-mono font-bold text-white">{completionRate}%</span>
                    <p className="text-[9px] text-gray-400 font-light max-w-[150px]">
                      Weekly progressive overload split adherence.
                    </p>
                  </div>

                  <div className="relative w-12 h-12 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.03)" strokeWidth="3" fill="transparent" />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#39ff14"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - completionRate / 100)}
                        className="opacity-95"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-white">
                      {completionRate}%
                    </div>
                  </div>
                </div>
              )}

              {/* Nutrition Compliance */}
              {nutritionRate !== null && (
                <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col gap-3">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">
                    NUTRITIONAL ADHERENCE
                  </span>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between font-mono text-[8px] text-gray-400">
                      <span>DAILY MEALS COMPLIANCE RATE</span>
                      <span>{nutritionRate}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyber-blue" style={{ width: `${nutritionRate}%` }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-panel p-5 rounded-xl border border-white/5 flex gap-3 items-center">
                <Trophy className="w-5 h-5 text-cyber-blue shrink-0 animate-bounce" />
                <div>
                  <span className="text-[8px] font-mono text-neon-green uppercase tracking-widest block">
                    MILESTONE TRACKER
                  </span>
                  <span className="text-[11px] font-bold text-white block">Metabolism locked</span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Calibration Offline */
          <div className="w-full glass-panel p-12 rounded-2xl border border-dashed border-cyber-blue/30 flex flex-col items-center justify-center text-center gap-4 py-20 pointer-events-auto">
            <div className="w-12 h-12 rounded-full bg-cyber-blue/5 border border-cyber-blue/20 flex items-center justify-center animate-pulse">
              <EyeOff className="w-5 h-5 text-cyber-blue" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-white tracking-widest uppercase">
                MONITORING TERMINAL OFFLINE
              </h3>
              <p className="text-xs text-gray-400 font-light max-w-sm mt-2 mx-auto leading-relaxed">
                Trends monitor offline. Log daily check-ins or dimension tape measurements inside your Dashboard to activate terminal trends monitoring.
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
