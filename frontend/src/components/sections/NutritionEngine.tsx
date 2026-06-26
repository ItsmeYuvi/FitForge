'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Flame, Beef, Wheat, Droplets, EyeOff } from 'lucide-react';

interface MacroCard {
  id: string;
  name: string;
  value: string;
  unit: string;
  role: string;
  color: string;
  glow: string;
  icon: React.ComponentType<any>;
  floatDuration: number;
}

interface NutritionEngineProps {
  nutrition?: any;
}

function TiltCard({ card }: { card: MacroCard }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Icon = card.icon;
  const isPending = card.value === 'PENDING';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: card.floatDuration, repeat: Infinity, ease: 'easeInOut' }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      data-cursor-text={isPending ? 'OFFLINE' : 'TILT'}
      className={`interactive-card relative w-full sm:w-[48%] lg:w-[23%] glass-panel p-5 rounded-2xl border flex flex-col justify-between min-h-[280px] pointer-events-auto transition-all duration-300 ${
        isPending ? 'border-white/5 opacity-55' : card.color + ' ' + card.glow
      }`}
    >
      <div className="flex justify-between items-start" style={{ transform: 'translateZ(30px)' }}>
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="font-mono text-[8px] text-gray-500 tracking-widest">MACRO // VAL</span>
      </div>

      <div style={{ transform: 'translateZ(45px)' }}>
        <span className={`text-3xl font-mono font-black ${isPending ? 'text-gray-600 animate-pulse' : 'text-white'}`}>
          {card.value}
        </span>
        {!isPending && <span className="text-[10px] font-mono text-gray-500 ml-1 uppercase">{card.unit}</span>}
        <h3 className="text-xs font-semibold tracking-wide text-white mt-1.5">{card.name}</h3>
      </div>

      <div style={{ transform: 'translateZ(20px)' }} className="mt-3 pt-3 border-t border-white/5">
        <span className="text-[8px] font-mono text-gray-500 uppercase block mb-0.5">BIOLOGICAL UTILITY</span>
        <p className="text-[9px] text-gray-400 font-light leading-relaxed">
          {card.role}
        </p>
      </div>
    </motion.div>
  );
}

export default function NutritionEngine({ nutrition }: NutritionEngineProps) {
  // Grab live values or pending signals
  const getValue = (id: string) => {
    if (!nutrition) return 'PENDING';
    switch (id) {
      case 'calories': return nutrition.calories.toLocaleString();
      case 'protein': return nutrition.protein.toString();
      case 'carbs': return nutrition.carbs.toString();
      case 'fats': return nutrition.fats.toString();
      default: return '---';
    }
  };

  const macroCards: MacroCard[] = [
    {
      id: 'calories',
      name: 'Energy Target',
      value: getValue('calories'),
      unit: 'kcal',
      role: 'Core cellular energy budget adjusted for lean deficit optimization.',
      color: 'border-cyber-blue/30 text-cyber-blue',
      glow: 'shadow-cyber-blue/5 hover:shadow-cyber-blue/10',
      icon: Flame,
      floatDuration: 5,
    },
    {
      id: 'protein',
      name: 'Somatic Protein',
      value: getValue('protein'),
      unit: 'g',
      role: 'Amino building blocks allocated to stimulate myofibrillar muscle synthesis.',
      color: 'border-neon-green/30 text-neon-green',
      glow: 'shadow-neon-green/5 hover:shadow-neon-green/10',
      icon: Beef,
      floatDuration: 6.2,
    },
    {
      id: 'carbs',
      name: 'Glycogen Fuel',
      value: getValue('carbs'),
      unit: 'g',
      role: 'Clean energy source. Synchronized with peak anaerobic workload days.',
      color: 'border-cyber-blue/30 text-cyber-blue',
      glow: 'shadow-cyber-blue/5 hover:shadow-cyber-blue/10',
      icon: Wheat,
      floatDuration: 5.6,
    },
    {
      id: 'fats',
      name: 'Hormonal Lipids',
      value: getValue('fats'),
      unit: 'g',
      role: 'Essential fatty acids to support cellular repair and endocrine balance.',
      color: 'border-neon-green/30 text-neon-green',
      glow: 'shadow-neon-green/5 hover:shadow-neon-green/10',
      icon: Droplets,
      floatDuration: 4.8,
    },
  ];

  return (
    <section className="relative w-full h-screen snap-start snap-always py-24 px-6 sm:px-12 md:px-24 flex items-center justify-center overflow-hidden z-20 shrink-0 select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-blue opacity-5 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10">
        
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16 text-center items-center">
          <span className="text-xs font-mono tracking-widest text-neon-green uppercase">
            SECTION 05 // AI NUTRITION ENGINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-none">
            Fuel Your Transformation
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-lg">
            Receive calorie targets, protein goals, and personalized meal plans generated specifically for your body and objective. Every recommendation is designed to maximize performance and recovery.
          </p>
        </div>

        {/* Cards container */}
        <div className="flex flex-wrap gap-6 justify-between items-stretch">
          {macroCards.map((card) => (
            <TiltCard key={card.id} card={card} />
          ))}
        </div>

      </div>
    </section>
  );
}
