'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Award, BarChart, Scale, Thermometer, User } from 'lucide-react';

interface MetricItem {
  id: string;
  name: string;
  value: string;
  unit: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface BodyScanProps {
  onHoverMetric: (metric: string) => void;
}

export default function BodyScan({ onHoverMetric }: BodyScanProps) {
  const metrics: MetricItem[] = [
    {
      id: 'height',
      name: 'Height Index',
      value: '180',
      unit: 'cm',
      description: 'Vertical skeleton scale vector. Calculated against baseline average distribution.',
      icon: User,
    },
    {
      id: 'weight',
      name: 'Mass Index',
      value: '78.5',
      unit: 'kg',
      description: 'Total gravity resistance weight. Subdivided into lean mass and lipid tissue categories.',
      icon: Scale,
    },
    {
      id: 'bmi',
      name: 'Body Mass Index',
      value: '24.2',
      unit: 'ratio',
      description: 'Proportional body mass ratio. Classified within the peak optimization standard quadrant.',
      icon: BarChart,
    },
    {
      id: 'bodyFat',
      name: 'Lipid Ratio',
      value: '14.8',
      unit: '%',
      description: 'Adipose tissue concentration estimate. Calculated using cybernetic neural density models.',
      icon: Award,
    },
    {
      id: 'bmr',
      name: 'Basal Metabolic Rate',
      value: '1,840',
      unit: 'kcal',
      description: 'Baseline organ thermal operation cost. Minimum daily survival wattage in idle state.',
      icon: Thermometer,
    },
    {
      id: 'tdee',
      name: 'Total Daily Energy Expenditure',
      value: '2,852',
      unit: 'kcal',
      description: 'Total daily energy usage. Measured including moderate movement coefficients.',
      icon: Activity,
    },
  ];

  return (
    <section className="relative w-full min-h-screen py-24 px-6 sm:px-12 md:px-24 flex flex-col justify-center z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto z-10 w-full">
        {/* Left Grid: Explanations */}
        <div className="flex flex-col gap-6">
          <span className="text-xs font-mono tracking-widest text-cyber-blue uppercase">
            SECTION 02 // BIOMETRIC BIO-SCAN
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight leading-none text-white">
            Deep-Tissue Neural Scan
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-light leading-relaxed max-w-md">
            As your data flow streams, the holographic matrix maps your physical structure. Move your cursor over any metric node to isolate and analyze specific skeletal nodes.
          </p>

          <div className="w-full h-[1px] bg-gradient-to-r from-cyber-blue/40 via-transparent to-transparent my-4" />

          {/* Interactive grid statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-lg border border-white/5">
              <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">SCAN ACCURACY</span>
              <span className="text-lg font-mono font-bold text-neon-green">99.8% VERIFIED</span>
            </div>
            <div className="glass-panel p-4 rounded-lg border border-white/5">
              <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">CALIBRATION VELOCITY</span>
              <span className="text-lg font-mono font-bold text-cyber-blue">0.14 SECONDS</span>
            </div>
          </div>
        </div>

        {/* Right Grid: Interactive Biometrics List */}
        <div className="flex flex-col gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.id}
                onMouseEnter={() => onHoverMetric(metric.id)}
                onMouseLeave={() => onHoverMetric('')}
                whileHover={{ x: 10, borderColor: 'rgba(57, 255, 20, 0.4)' }}
                data-cursor-text="ISOLATE"
                className="interactive-card glass-panel p-5 rounded-xl border border-white/5 flex gap-4 items-center justify-between transition-all duration-300 pointer-events-auto"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyber-blue/10 flex items-center justify-center border border-cyber-blue/20">
                    <Icon className="w-5 h-5 text-cyber-blue" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-wide">{metric.name}</h3>
                    <p className="text-[10px] text-gray-400 font-light max-w-xs">{metric.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-neon-green">{metric.value}</span>
                  <span className="text-[10px] font-mono text-gray-500 ml-1 uppercase">{metric.unit}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
