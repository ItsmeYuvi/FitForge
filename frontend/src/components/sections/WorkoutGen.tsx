'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Cpu, Calendar, ChevronRight, Zap } from 'lucide-react';

interface WorkoutGenProps {
  workout?: any;
}

export default function WorkoutGen({ workout }: WorkoutGenProps) {
  // Pull live data or use clean conceptual indicators
  const splitName = workout ? workout.workoutSplit : 'Active Training Target';
  const overloadStrategy = workout ? workout.progressiveOverloadStrategy : 'Calibrating Progressive Loading';

  const flowSteps = [
    {
      num: '01',
      title: 'BIOMETRIC STREAM',
      icon: FileText,
      color: 'border-cyber-blue/30 text-cyber-blue',
      glow: 'shadow-cyber-blue/5',
      items: [
        workout ? `Skeletal parameters active` : 'Awaiting skeleton vector inputs',
        workout ? `Load targets identified` : 'Establishing baseline energy cost',
        workout ? `Goal split initialized` : 'Goal targets mapping...',
      ],
    },
    {
      num: '02',
      title: 'NEURAL OS SYNAPSE',
      icon: Cpu,
      color: 'border-neon-green/30 text-neon-green',
      glow: 'shadow-neon-green/5',
      items: [
        'Caloric workload balancing',
        'Load index distribution',
        workout ? 'Overload index compiled' : 'Volume curve compilation...',
      ],
    },
    {
      num: '03',
      title: 'DYNAMICS BLUEPRINT',
      icon: Calendar,
      color: 'border-cyber-blue/30 text-cyber-blue',
      glow: 'shadow-cyber-blue/5',
      items: [
        `Split: ${splitName}`,
        'Mechanical tension targeting',
        workout ? 'Overload strategy compiled' : 'Joint strain protection levels',
      ],
    },
  ];

  return (
    <section className="relative w-full h-screen snap-start snap-always py-24 px-6 sm:px-12 md:px-24 flex items-center justify-center overflow-hidden z-20 shrink-0 select-none">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10">
        {/* Section Title */}
        <div className="flex flex-col gap-4 text-center items-center mb-16">
          <span className="text-xs font-mono tracking-widest text-cyber-blue uppercase">
            SECTION 04 // ADAPTIVE INTELLIGENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-none">
            A Plan That Evolves With You
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-lg">
            FitForge continuously learns from your workouts, recovery, progress, and performance. As your body changes, your training adapts automatically.
          </p>
        </div>

        {/* Pipeline Layout */}
        <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-12 items-center justify-between">
          
          {/* Animated Connectors */}
          <div className="absolute inset-0 hidden lg:block pointer-events-none z-0">
            <svg className="w-full h-full" style={{ minHeight: '260px' }}>
              <defs>
                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#39ff14" />
                  <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
              </defs>
              <path
                d="M 260,130 L 480,130"
                stroke="url(#gradient-line)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="8 8"
                className="animate-[dash_20s_linear_infinite]"
              />
              <path
                d="M 680,130 L 900,130"
                stroke="url(#gradient-line)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="8 8"
                className="animate-[dash_20s_linear_infinite]"
              />
            </svg>
            <style>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -1000;
                }
              }
            `}</style>
          </div>

          {/* Cards */}
          {flowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className={`interactive-card relative w-full lg:w-[32%] glass-panel p-5 rounded-2xl border ${step.color} ${step.glow} pointer-events-auto z-10`}
                >
                  <div className="absolute top-4 right-4 font-mono text-[8px] text-gray-500 tracking-wider">
                    STEP // {step.num}
                  </div>

                  <div className="flex gap-4 items-center mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold tracking-wider text-white">
                        {step.title}
                      </h3>
                      <span className="text-[7px] font-mono text-gray-500 uppercase tracking-widest">
                        Status: Operational
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {step.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex gap-2 items-center bg-black/30 p-2.5 rounded-lg border border-white/5 font-mono text-[9px]"
                      >
                        <Zap className="w-3 h-3 text-neon-green shrink-0" />
                        <span className="text-gray-300 truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {idx < 2 && (
                  <div className="lg:hidden flex items-center justify-center my-1 text-cyber-blue">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

        </div>
      </div>
    </section>
  );
}
