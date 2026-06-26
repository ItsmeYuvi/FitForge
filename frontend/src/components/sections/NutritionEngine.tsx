'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';

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

// 3D Tilt Card component
function TiltCard({ card }: { card: MacroCard }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Map coordinates to degrees of rotation
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative mouse coordinates from center of card
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    // Reset back to center smoothly
    x.set(0);
    y.set(0);
  };

  const Icon = card.icon;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        y: [0, -12, 0],
      }}
      transition={{
        duration: card.floatDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      data-cursor-text="TILT"
      className={`interactive-card relative w-full sm:w-[48%] lg:w-[23%] glass-panel p-6 rounded-2xl border ${card.color} ${card.glow} flex flex-col justify-between min-h-[300px] pointer-events-auto transition-shadow duration-300`}
    >
      {/* Icon Ring */}
      <div className="flex justify-between items-start" style={{ transform: 'translateZ(30px)' }}>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="font-mono text-[9px] text-gray-500 tracking-widest">MACRO // VAL</span>
      </div>

      {/* Main Metric */}
      <div style={{ transform: 'translateZ(50px)' }}>
        <span className="text-4xl font-mono font-black text-white">{card.value}</span>
        <span className="text-xs font-mono text-gray-500 ml-1 uppercase">{card.unit}</span>
        <h3 className="text-sm font-semibold tracking-wide text-white mt-2">{card.name}</h3>
      </div>

      {/* Role explanation */}
      <div style={{ transform: 'translateZ(20px)' }} className="mt-4 pt-4 border-t border-white/5">
        <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">BIOLOGICAL UTILITY</span>
        <p className="text-[10px] text-gray-400 font-light leading-relaxed">
          {card.role}
        </p>
      </div>
    </motion.div>
  );
}

export default function NutritionEngine() {
  const macroCards: MacroCard[] = [
    {
      id: 'calories',
      name: 'Energy Target',
      value: '2,352',
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
      value: '172',
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
      value: '228',
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
      value: '68',
      unit: 'g',
      role: 'Essential fatty acids to support cellular repair and endocrine balance.',
      color: 'border-neon-green/30 text-neon-green',
      glow: 'shadow-neon-green/5 hover:shadow-neon-green/10',
      icon: Droplets,
      floatDuration: 4.8,
    },
  ];

  return (
    <section className="relative w-full min-h-screen py-24 px-6 sm:px-12 md:px-24 flex flex-col justify-center z-20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-blue opacity-5 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10">
        
        {/* Header */}
        <div className="flex flex-col gap-4 mb-20 text-center items-center">
          <span className="text-xs font-mono tracking-widest text-neon-green uppercase">
            SECTION 05 // NUTRITION COMBUSTION ENGINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-none">
            Macro-Nutrient Fuel Ratios
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-lg">
            Hover over the floating macro units to inspect their structural utility. Every gram is calculated to nourish muscular hypertrophy and speed up systemic cellular recovery.
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
