'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import Hero from '@/components/sections/Hero';
import BodyScan from '@/components/sections/BodyScan';
import DigitalTwin from '@/components/sections/DigitalTwin';
import WorkoutGen from '@/components/sections/WorkoutGen';
import NutritionEngine from '@/components/sections/NutritionEngine';
import DashboardPreview from '@/components/sections/DashboardPreview';
import SocialProof from '@/components/sections/SocialProof';
import CTA from '@/components/sections/CTA';
import { Dumbbell } from 'lucide-react';
import Link from 'next/link';

// Dynamically load R3F AthleteScene to avoid server-side rendering issues
const AthleteScene = dynamic(
  () => import('@/components/canvas/AthleteScene'),
  { ssr: false }
);

export default function Home() {
  const { user } = useUser();
  const [activeMetric, setActiveMetric] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Live database profile states
  const [profile, setProfile] = useState<any>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [nutrition, setNutrition] = useState<any>(null);
  const [weeklyReview, setWeeklyReview] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);

  // Fetch live stats from database
  const fetchLiveStats = async () => {
    if (!user) return;
    try {
      const clerkId = user.id;

      // Profile details
      const profileRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/onboarding/${clerkId}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // Workout plan details
      const workoutRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/workout/${clerkId}`);
      if (workoutRes.ok) {
        const workoutData = await workoutRes.json();
        setWorkout(workoutData);
      }

      // Nutrition plan details
      const nutritionRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/nutrition/${clerkId}`);
      if (nutritionRes.ok) {
        const nutritionData = await nutritionRes.json();
        setNutrition(nutritionData);
      }

      // Weekly AI review summary
      const reviewRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/progress/weekly-review/${clerkId}`);
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        setWeeklyReview(reviewData);
      }

      // Tape measurements logs
      const progressRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/progress/measurement/${clerkId}`);
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setMeasurements(progressData);
      }
    } catch (err) {
      console.warn('Error fetching landing page database logs:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLiveStats();
    }
  }, [user]);

  // Track parent container scrolling positions
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const progress = target.scrollTop / (target.scrollHeight - target.clientHeight);
    setScrollProgress(progress);
  };

  const scrollToBlueprint = () => {
    const el = document.getElementById('blueprint-generator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      onScroll={handleScroll}
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth relative bg-dark-bg text-foreground selection:bg-neon-green selection:text-black"
    >
      {/* 3D Holographic Athlete Layer (Fixed Background overlay) */}
      <div className="fixed top-0 right-0 w-full lg:w-1/2 h-screen z-0 opacity-40 lg:opacity-95 pointer-events-none">
        <AthleteScene scrollProgress={scrollProgress} activeMetric={activeMetric} />
      </div>

      {/* Global Navigation Header (Snaps out of scroll flow) */}
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

        {user ? (
          <Link
            href="/dashboard"
            data-cursor-text="PANEL"
            className="px-4 py-2 border border-neon-green/30 text-neon-green hover:bg-neon-green hover:text-black rounded font-mono text-[9px] tracking-widest uppercase transition-all duration-300 pointer-events-auto"
          >
            DASHBOARD PANEL
          </Link>
        ) : (
          <div className="flex gap-4 items-center">
            <Link
              href="/sign-in"
              data-cursor-text="LOGIN"
              className="px-4 py-2 text-gray-400 hover:text-white rounded font-mono text-[9px] tracking-widest uppercase transition-all duration-300 pointer-events-auto"
            >
              LOG IN
            </Link>
            <Link
              href="/sign-up"
              data-cursor-text="START"
              className="px-4 py-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue hover:text-black rounded font-mono text-[9px] tracking-widest uppercase transition-all duration-300 pointer-events-auto"
            >
              GET STARTED
            </Link>
          </div>
        )}
      </header>

      {/* Content Sections (Each is snap-aligned) */}
      <div className="relative z-10 w-full">
        
        {/* Station 1: Hero */}
        <Hero onGenerateClick={scrollToBlueprint} />

        {/* Station 2: AI Body Scan */}
        <div id="biometrics" className="w-full snap-start snap-always">
          <BodyScan onHoverMetric={setActiveMetric} profile={profile} />
        </div>

        {/* Station 3: AI Fitness Twin */}
        <div id="digital-twin" className="w-full snap-start snap-always">
          <DigitalTwin profile={profile} />
        </div>

        {/* Station 4: Workout Gen */}
        <div id="workout-pipeline" className="w-full snap-start snap-always">
          <WorkoutGen workout={workout} />
        </div>

        {/* Station 5: Nutrition Engine */}
        <div id="nutrition-engine" className="w-full snap-start snap-always">
          <NutritionEngine nutrition={nutrition} />
        </div>

        {/* Station 6: Dashboard Preview */}
        <div id="dashboard-preview" className="w-full snap-start snap-always">
          <DashboardPreview weeklyReview={weeklyReview} measurements={measurements} />
        </div>

        {/* Station 7: Social Proof */}
        <div className="w-full snap-start snap-always">
          <SocialProof />
        </div>

        {/* Station 8: CTA / Generator */}
        <div className="w-full snap-start snap-always">
          <CTA />
        </div>

      </div>

      {/* Futuristic Grid Overlay on background */}
      <div className="fixed inset-0 cyber-grid opacity-[0.015] pointer-events-none z-0" />
    </div>
  );
}
