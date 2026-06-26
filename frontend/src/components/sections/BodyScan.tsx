'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Award, BarChart, Scale, Thermometer, User, RefreshCw } from 'lucide-react';

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
  profile?: any;
}

export default function BodyScan({ onHoverMetric, profile }: BodyScanProps) {
  const activeProfile = profile || {
    age: 26,
    gender: 'male',
    height: 182,
    weight: 84,
    activityLevel: 'moderate',
    goal: 'lose_fat',
  };

  // Helper to calculate biometrics on the fly from database profile
  const getMetricValue = (id: string) => {
    const hM = activeProfile.height / 100;
    const bmiVal = activeProfile.weight / (hM * hM);
    const isMale = activeProfile.gender === 'male';
    const bmrVal = isMale 
      ? 10 * activeProfile.weight + 6.25 * activeProfile.height - 5 * activeProfile.age + 5
      : 10 * activeProfile.weight + 6.25 * activeProfile.height - 5 * activeProfile.age - 161;

    switch (id) {
      case 'height':
        return activeProfile.height.toString();
      case 'weight':
        return activeProfile.weight.toString();
      case 'bmi':
        return bmiVal.toFixed(1);
      case 'bodyFat': {
        const estFat = isMale 
          ? 1.20 * bmiVal + 0.23 * activeProfile.age - 16.2 
          : 1.20 * bmiVal + 0.23 * activeProfile.age - 5.4;
        return Math.max(3, estFat).toFixed(1);
      }
      case 'bmr':
        return Math.round(bmrVal).toLocaleString();
      case 'tdee': {
        const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
        const tdeeVal = bmrVal * (multipliers[activeProfile.activityLevel] || 1.2);
        return Math.round(tdeeVal).toLocaleString();
      }
      default:
        return '---';
    }
  };

  const metrics: MetricItem[] = [
    {
      id: 'height',
      name: 'Height Index',
      value: getMetricValue('height'),
      unit: 'cm',
      description: 'Vertical skeleton scale vector. Calculated against baseline average distribution.',
      icon: User,
    },
    {
      id: 'weight',
      name: 'Mass Index',
      value: getMetricValue('weight'),
      unit: 'kg',
      description: 'Total gravity resistance weight. Subdivided into lean mass and lipid tissue categories.',
      icon: Scale,
    },
    {
      id: 'bmi',
      name: 'Body Mass Index',
      value: getMetricValue('bmi'),
      unit: 'ratio',
      description: 'Proportional body mass ratio. Classified within the peak optimization standard quadrant.',
      icon: BarChart,
    },
    {
      id: 'bodyFat',
      name: 'Lipid Ratio',
      value: getMetricValue('bodyFat'),
      unit: '%',
      description: 'Adipose tissue concentration estimate. Calculated using cybernetic neural density models.',
      icon: Award,
    },
    {
      id: 'bmr',
      name: 'Basal Metabolic Rate',
      value: getMetricValue('bmr'),
      unit: 'kcal',
      description: 'Baseline organ thermal operation cost. Minimum daily survival wattage in idle state.',
      icon: Thermometer,
    },
    {
      id: 'tdee',
      name: 'Total Daily Energy Expenditure',
      value: getMetricValue('tdee'),
      unit: 'kcal',
      description: 'Total daily energy usage. Measured including moderate movement coefficients.',
      icon: Activity,
    },
  ];

  return (
    <section className="relative w-full h-screen snap-start snap-always py-24 px-6 sm:px-12 md:px-24 flex items-center justify-center overflow-hidden z-20 shrink-0 select-none">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto z-10 w-full">
        {/* Left Grid: Explanations */}
        <div className="flex flex-col gap-6">
          <span className="text-xs font-mono tracking-widest text-cyber-blue uppercase">
            SECTION 02 // FITNESS DNA ANALYSIS
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight leading-none text-white">
            Your Fitness Blueprint
          </h2>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-md">
            Every transformation begins with understanding your body. FitForge analyzes your height, weight, activity level, fitness goals, training experience, and recovery patterns to build a complete fitness profile.
          </p>

          <div className="w-full h-[1px] bg-gradient-to-r from-cyber-blue/40 via-transparent to-transparent my-4" />

          {/* Interactive grid statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-lg border border-white/5">
              <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">SCAN CALIBRATION</span>
              <span className="text-sm font-mono font-bold text-neon-green">
                {profile ? 'ACTIVE SYNAPSE' : 'DEMO MODE'}
              </span>
            </div>
            <div className="glass-panel p-4 rounded-lg border border-white/5">
              <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">CALIBRATION SPEED</span>
              <span className="text-sm font-mono font-bold text-cyber-blue">0.14 SECONDS</span>
            </div>
          </div>
        </div>

        {/* Right Grid: Interactive Biometrics List */}
        <div className="flex flex-col gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isPending = metric.value === 'PENDING';

            return (
              <motion.div
                key={metric.id}
                onMouseEnter={() => onHoverMetric(metric.id)}
                onMouseLeave={() => onHoverMetric('')}
                whileHover={{ x: 8, borderColor: 'rgba(57, 255, 20, 0.4)' }}
                data-cursor-text={isPending ? 'OFFLINE' : 'ISOLATE'}
                className={`interactive-card glass-panel p-5 rounded-xl border flex gap-4 items-center justify-between transition-all duration-300 pointer-events-auto ${
                  isPending ? 'border-white/5 opacity-55' : 'border-cyber-blue/15'
                }`}
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
                  <span className={`text-2xl font-mono font-bold ${isPending ? 'text-gray-600 animate-pulse' : 'text-neon-green'}`}>
                    {metric.value}
                  </span>
                  {!isPending && (
                    <span className="text-[10px] font-mono text-gray-500 ml-1 uppercase">{metric.unit}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
