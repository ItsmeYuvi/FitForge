'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Cpu, Calendar, ChevronRight, Zap } from 'lucide-react';

export default function WorkoutGen() {
  const flowSteps = [
    {
      num: '01',
      title: 'BIOMETRIC STREAM',
      icon: FileText,
      color: 'border-cyber-blue/30 text-cyber-blue',
      glow: 'shadow-cyber-blue/5',
      items: [
        'Skeletal dimensions (180cm)',
        'Total mass vector (78.5kg)',
        'Hypertrophic Goal: lean mass',
        'Metabolic Idle Index: 1,840kcal',
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
        'System recovery modeling',
        'Volume curve compilation',
      ],
    },
    {
      num: '03',
      title: 'DYNAMICS BLUEPRINT',
      icon: Calendar,
      color: 'border-cyber-blue/30 text-cyber-blue',
      glow: 'shadow-cyber-blue/5',
      items: [
        '7-day progressive overload splits',
        'Mechanical tension targeting',
        'Joint strain protection levels',
        'Adaptive nutrition syncing',
      ],
    },
  ];

  return (
    <section className="relative w-full min-h-screen py-24 px-6 sm:px-12 md:px-24 flex flex-col justify-center z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10">
        {/* Section Title */}
        <div className="flex flex-col gap-4 text-center items-center mb-20">
          <span className="text-xs font-mono tracking-widest text-cyber-blue uppercase">
            SECTION 04 // PIPELINE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-none">
            Biometric Compilation Pipeline
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-lg">
            See how raw biometric inputs undergo neural synapse processing before compiling into a physical overload blueprint.
          </p>
        </div>

        {/* Pipeline Layout */}
        <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-between">
          
          {/* Animated Glowing Connector lines (SVG) */}
          <div className="absolute inset-0 hidden lg:block pointer-events-none z-0">
            <svg className="w-full h-full" style={{ minHeight: '300px' }}>
              <defs>
                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#39ff14" />
                  <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
              </defs>
              
              {/* Connector 1 -> 2 */}
              <path
                d="M 280,150 L 500,150"
                stroke="url(#gradient-line)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="8 8"
                className="animate-[dash_20s_linear_infinite]"
              />
              {/* Connector 2 -> 3 */}
              <path
                d="M 720,150 L 940,150"
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

          {/* Cards mapping */}
          {flowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={idx}>
                {/* Step Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className={`interactive-card relative w-full lg:w-[32%] glass-panel p-6 rounded-2xl border ${step.color} ${step.glow} pointer-events-auto z-10`}
                >
                  {/* Step ID tag */}
                  <div className="absolute top-5 right-5 font-mono text-[9px] text-gray-500 tracking-wider">
                    STEP // {step.num}
                  </div>

                  <div className="flex gap-4 items-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold tracking-wider text-white">
                        {step.title}
                      </h3>
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                        Status: Operational
                      </span>
                    </div>
                  </div>

                  {/* Bullet list of details */}
                  <div className="flex flex-col gap-3">
                    {step.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex gap-3 items-center bg-black/30 p-2.5 rounded-lg border border-white/5 font-mono text-[10px]"
                      >
                        <Zap className="w-3.5 h-3.5 text-neon-green shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Mobile arrows between cards */}
                {idx < 2 && (
                  <div className="lg:hidden flex items-center justify-center my-2 text-cyber-blue">
                    <ChevronRight className="w-6 h-6 rotate-90" />
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
