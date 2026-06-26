'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import BodyScan from '@/components/sections/BodyScan';
import DigitalTwin from '@/components/sections/DigitalTwin';
import WorkoutGen from '@/components/sections/WorkoutGen';
import NutritionEngine from '@/components/sections/NutritionEngine';
import DashboardPreview from '@/components/sections/DashboardPreview';
import SocialProof from '@/components/sections/SocialProof';
import CTA from '@/components/sections/CTA';
import { Dumbbell } from 'lucide-react';

// Dynamically load R3F AthleteScene to avoid server-side rendering issues
const AthleteScene = dynamic(
  () => import('@/components/canvas/AthleteScene'),
  { ssr: false }
);

export default function Home() {
  const [activeMetric, setActiveMetric] = useState<string>('');

  const scrollToBlueprint = () => {
    const el = document.getElementById('blueprint-generator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-dark-bg text-foreground overflow-x-hidden selection:bg-neon-green selection:text-black">
      
      {/* 3D Holographic Athlete Layer (Fixed Background) */}
      <div className="fixed top-0 right-0 w-full lg:w-1/2 h-screen z-0 opacity-40 lg:opacity-90 pointer-events-none">
        <AthleteScene activeMetric={activeMetric} />
      </div>

      {/* Global Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/5 py-4 px-6 sm:px-12 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-cyber-blue animate-pulse" />
          <span className="font-display font-black text-sm tracking-widest text-white">
            FITFORGE <span className="text-neon-green">AI</span>
          </span>
        </div>

        <nav className="hidden md:flex gap-6 font-mono text-[9px] tracking-widest text-gray-400">
          <a href="#biometrics" className="hover:text-white transition-colors duration-200">01 // SCAN</a>
          <a href="#digital-twin" className="hover:text-white transition-colors duration-200">02 // TWIN</a>
          <a href="#workout-pipeline" className="hover:text-white transition-colors duration-200">03 // PIPELINE</a>
          <a href="#nutrition-engine" className="hover:text-white transition-colors duration-200">04 // NUTRITION</a>
          <a href="#dashboard-preview" className="hover:text-white transition-colors duration-200">05 // TERMINAL</a>
        </nav>

        <button
          onClick={scrollToBlueprint}
          data-cursor-text="LAUNCH"
          className="px-4 py-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue hover:text-black rounded font-mono text-[9px] tracking-widest uppercase transition-all duration-300 pointer-events-auto"
        >
          METAMORPHOSIS
        </button>
      </header>

      {/* Content Sections */}
      <div className="relative z-10 w-full">
        
        {/* Section 1: Hero */}
        <Hero onGenerateClick={scrollToBlueprint} />

        {/* Section 2: AI Body Scan */}
        <div id="biometrics">
          <BodyScan onHoverMetric={setActiveMetric} />
        </div>

        {/* Section 3: AI Fitness Twin */}
        <div id="digital-twin">
          <DigitalTwin />
        </div>

        {/* Section 4: Workout Generation */}
        <div id="workout-pipeline">
          <WorkoutGen />
        </div>

        {/* Section 5: Nutrition Engine */}
        <div id="nutrition-engine">
          <NutritionEngine />
        </div>

        {/* Section 6: Dashboard Preview */}
        <DashboardPreview />

        {/* Section 7: Social Proof */}
        <SocialProof />

        {/* Section 8: CTA / Generator */}
        <CTA />

      </div>

      {/* Futuristic Grid Overlay on background */}
      <div className="fixed inset-0 cyber-grid opacity-[0.015] pointer-events-none z-0" />
    </main>
  );
}
