'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Cpu, Send, ShieldAlert, CheckCircle, Scale, Dumbbell, Sparkles, Activity, Utensils, Calendar } from 'lucide-react';
import Link from 'next/link';

// Dynamically load R3F AthleteScene to avoid server-side rendering issues
const AthleteScene = dynamic(
  () => import('@/components/canvas/AthleteScene'),
  { ssr: false }
);

export default function Onboarding() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // Current step index (0 to 6)
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form parameters
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('180');
  const [weight, setWeight] = useState('78');
  const [goal, setGoal] = useState('lose_fat');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [workoutDays, setWorkoutDays] = useState('4');
  const [sessionDuration, setSessionDuration] = useState('60');
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(['gym']);
  const [dietaryPreference, setDietaryPreference] = useState('non_vegetarian');
  const [injuries, setInjuries] = useState('');

  // Redirect to dashboard if profile already exists (skip onboarding)
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/');
      } else {
        const checkExistingProfile = async () => {
          try {
            const res = await fetch(`https://fitforge-production-0c79.up.railway.app/api/onboarding/${user.id}`);
            if (res.ok) {
              router.push('/dashboard');
            }
          } catch (err) {
            console.error('Failed to verify profile status:', err);
          }
        };
        checkExistingProfile();
      }
    }
  }, [isLoaded, user, router]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0 && currentStep < 6) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Submit data to backend on Step 6 transition to Step 7
  const triggerCompilation = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');

    try {
      const clerkId = user.id;

      // 1. Save onboarding profile
      const profileRes = await fetch('https://fitforge-production-0c79.up.railway.app/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId,
          age: Number(age),
          gender,
          height: Number(height),
          weight: Number(weight),
          goal,
          experienceLevel,
          activityLevel,
          workoutDays: Number(workoutDays),
          sessionDuration: Number(sessionDuration),
          availableEquipment,
          dietaryPreference,
          injuries
        })
      });

      if (!profileRes.ok) throw new Error('Failed to record fitness metrics.');

      // 2. Trigger AI Workout Generator
      const workoutRes = await fetch('https://fitforge-production-0c79.up.railway.app/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId })
      });

      if (!workoutRes.ok) throw new Error('AI Workout Generator compilation failure.');

      // 3. Trigger AI Nutrition Generator
      const nutritionRes = await fetch('https://fitforge-production-0c79.up.railway.app/api/nutrition/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId })
      });

      if (!nutritionRes.ok) throw new Error('AI Nutrition Engine compile failure.');

      // All plans compiled! Move to summary step
      setIsLoading(false);
      setCurrentStep(6);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Verification failure. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center font-mono text-xs text-cyber-blue gap-3">
        <Cpu className="w-6 h-6 animate-spin" />
        <span>INITIALIZING FITFORGE METAMORPHOSIS SECURE LINK...</span>
      </div>
    );
  }

  // Calculate Mifflin-St Jeor values client-side for summary preview
  const weightNum = Number(weight) || 70;
  const heightNum = Number(height) || 170;
  const ageNum = Number(age) || 25;
  const bmr = gender === 'male' 
    ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5 
    : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  const tdee = Math.round(bmr * multiplier);

  let targetCalories = tdee;
  let goalTimeline = '90 Days';
  let aiRecommendation = '';

  if (goal === 'lose_fat') {
    targetCalories = tdee - 500;
    goalTimeline = '90 Days // Target Body Fat Reduction (-6kg)';
    aiRecommendation = 'AI Synapse calibration recommends prioritizing compound movements to preserve lean mass. Nutrition is locked to a 500kcal deficit with high somatic protein density (2g/kg).';
  } else if (goal === 'build_muscle') {
    targetCalories = tdee + 300;
    goalTimeline = '120 Days // Hypertrophy Overload Peak (+3.5kg)';
    aiRecommendation = 'AI Synapse calibration recommends daily progressive overload with 1-2 rep logs tracked weekly. Nutrition scheduled for dynamic anabolic surplus (+300kcal) and clean carbs.';
  } else {
    targetCalories = tdee;
    goalTimeline = '180 Days // Core Physical Recomposition';
    aiRecommendation = 'AI Synapse calibration recommends metabolic recomposition. Compound lifting splits at 4 days weekly frequency combined with clean maintenance macronutrient ratios.';
  }

  // Determine active joint node to highlight based on steps
  const getActiveJoint = () => {
    switch (currentStep) {
      case 0: return 'head';
      case 1: return 'neck';
      case 2: return 'chest';
      case 3: return 'l-shoulder';
      case 4: return 'r-elbow';
      case 5: return 'l-hip';
      case 6: return 'pelvis';
      default: return '';
    }
  };

  const completionPercent = Math.round(((currentStep + 1) / 7) * 100);

  return (
    <div className="min-h-screen w-screen bg-dark-bg text-foreground flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* Left Side: Immersive 3D Visualizer */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative bg-dark-surface border-r border-white/5 items-center justify-center p-12 overflow-hidden">
        
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 cyber-grid opacity-[0.015] pointer-events-none z-0" />
        
        {/* R3F Athlete Canvas Container */}
        <div className="absolute inset-0 w-full h-full z-0 opacity-80 pointer-events-none">
          <AthleteScene scrollProgress={currentStep / 6} activeMetric={getActiveJoint()} />
        </div>

        {/* Diagonal glowing flare in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-blue opacity-5 blur-[150px] pointer-events-none" />

        {/* Floating cards reacting to user steps */}
        {currentStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-[18%] left-[8%] glass-panel p-4 rounded-xl border border-cyber-blue/20 w-56 shadow-2xl z-10"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-mono text-cyber-blue tracking-widest">// BIOMETRICS MATRIX</span>
              <Scale className="w-3.5 h-3.5 text-cyber-blue" />
            </div>
            <span className="text-xs font-mono font-bold text-white block">Height: {height} cm</span>
            <span className="text-xs font-mono font-bold text-white block">Weight: {weight} kg</span>
            <span className="text-[9px] text-gray-500 font-mono block mt-1">Skeletal vectors locked</span>
          </motion.div>
        )}

        {currentStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-[20%] right-[8%] glass-panel p-4 rounded-xl border border-neon-green/20 w-60 shadow-2xl z-10"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-mono text-neon-green tracking-widest">// PATH SELECTION</span>
              <Dumbbell className="w-3.5 h-3.5 text-neon-green" />
            </div>
            <span className="text-xs font-mono font-bold text-white block">Goal: {goal.replace('_', ' ').toUpperCase()}</span>
            <span className="text-[9px] text-gray-500 font-mono block mt-1">Exp: {experienceLevel.toUpperCase()}</span>
          </motion.div>
        )}

        {currentStep === 6 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-[48%] right-[12%] glass-panel p-4 rounded-xl border-neon-green/30 border w-64 shadow-2xl z-10"
          >
            <div className="flex gap-3 items-start">
              <Sparkles className="w-4 h-4 text-neon-green shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="text-[8px] font-mono text-neon-green tracking-widest block uppercase">NEURAL CALIBRATION VERIFIED</span>
                <p className="text-[10px] text-gray-300 font-light leading-relaxed mt-1">
                  Custom AI Split compiled successfully. Ready for Metamorphosis terminal deployment.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Heading in bottom-left */}
        <div className="absolute bottom-16 left-16 z-25 max-w-md flex flex-col gap-3">
          <span className="text-[9px] font-mono tracking-[0.2em] text-cyber-blue uppercase block">
            // FITFORGE PILOT CALIBRATION //
          </span>
          <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight leading-none">
            Onboarding Matrix
          </h2>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Aligning your biometrics vectors to program the digital twin database. Keep moving through the sequence inputs.
          </p>
        </div>

      </div>

      {/* Right Side: Onboarding Form Wizard */}
      <div className="w-full lg:w-1/2 h-full min-h-screen overflow-y-auto flex flex-col justify-between py-12 px-6 sm:px-12 md:px-20 z-10">
        
        {/* Header navigation bar */}
        <header className="flex justify-between items-center w-full max-w-md mx-auto mb-8 lg:mb-0">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-cyber-blue animate-pulse" />
            <span className="font-display font-black text-sm tracking-widest text-white">
              FITFORGE <span className="text-neon-green">AI</span>
            </span>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-neon-green uppercase animate-pulse">
            // STATUS: SECURE ONBOARDING
          </span>
        </header>

        {/* Main Onboarding Cards */}
        <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-6">
          <div className="w-full glass-panel p-8 sm:p-10 rounded-2xl border border-white/10 shadow-2xl relative">
            
            {/* Header progress bar */}
            <div className="flex justify-between items-center mb-4 font-mono text-[8px] text-gray-500 tracking-wider">
              <span>PILOT ONBOARDING VECTOR</span>
              <span className="text-neon-green">{completionPercent}% STABLE</span>
            </div>

            <div className="w-full h-[2px] bg-white/5 rounded-full mb-8 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyber-blue to-neon-green" 
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {error && (
              <div className="bg-red-950/20 border border-red-800 text-red-400 p-3 rounded-lg flex items-center gap-2 mb-6 font-mono text-[9px] uppercase">
                <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce" />
                <span>{error}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              
              {/* Step 1: Personal Information */}
              {currentStep === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="flex flex-col gap-6 font-mono text-xs text-gray-400"
                >
                  <div>
                    <h3 className="text-base font-display font-black text-white uppercase tracking-wider">01 // Personal Information</h3>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wide">Select your physiological baseline profiles</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-[9px] uppercase tracking-wider font-bold">AGE (YEARS)</label>
                    <input 
                      type="number" required min="14" max="90" value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-[9px] uppercase tracking-wider font-bold">PHYSIOLOGICAL GENDER</label>
                    <div className="flex gap-4">
                      {['male', 'female'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`flex-1 p-3.5 rounded-lg border text-center uppercase tracking-wider font-bold transition-all duration-200 ${
                            gender === g 
                              ? 'bg-cyber-blue/10 border-cyber-blue/40 text-white' 
                              : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Body Metrics */}
              {currentStep === 1 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="flex flex-col gap-6 font-mono text-xs text-gray-400"
                >
                  <div>
                    <h3 className="text-base font-display font-black text-white uppercase tracking-wider">02 // Body Metrics</h3>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wide">Enter precise measurements to calibrate calculations</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-[9px] uppercase tracking-wider font-bold">HEIGHT (CM)</label>
                    <input 
                      type="number" required min="100" max="250" value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-[9px] uppercase tracking-wider font-bold">WEIGHT (KG)</label>
                    <input 
                      type="number" required min="35" max="220" value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Goals */}
              {currentStep === 2 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="flex flex-col gap-5 font-mono text-xs text-gray-400"
                >
                  <div>
                    <h3 className="text-base font-display font-black text-white uppercase tracking-wider">03 // Composition Goals</h3>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wide">Define your target biological objective</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { id: 'lose_fat', label: 'Lipid Loss (Fat Deficit)', desc: 'Accelerate fat oxidation while retaining myofibrillar tissue.' },
                      { id: 'build_muscle', label: 'Hypertrophy (Muscle Gain)', desc: 'Prioritize muscle tissue hypertrophy through caloric surplus.' },
                      { id: 'recomposition', label: 'Recomposition (Balance)', desc: 'Simultaneously decrease fat and generate lean skeletal mass.' }
                    ].map((target) => (
                      <button
                        key={target.id}
                        type="button"
                        onClick={() => setGoal(target.id)}
                        className={`p-4 rounded-lg border text-left flex flex-col gap-1 transition-all duration-200 ${
                          goal === target.id 
                            ? 'bg-neon-green/10 border-neon-green/40 text-white' 
                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                        }`}
                      >
                        <span className="font-bold uppercase tracking-wider text-xs">{target.label}</span>
                        <span className="text-[9px] text-gray-400 font-light leading-normal">{target.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Training Experience */}
              {currentStep === 3 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="flex flex-col gap-5 font-mono text-xs text-gray-400"
                >
                  <div>
                    <h3 className="text-base font-display font-black text-white uppercase tracking-wider">04 // Training Experience</h3>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wide">Rate your lift consistency profile</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { id: 'beginner', label: 'Beginner Pilot', desc: 'Under 12 months of structured compound progressive overload.' },
                      { id: 'intermediate', label: 'Intermediate lifter', desc: '1 to 3 years of consistent barbell/dumbbell training.' },
                      { id: 'advanced', label: 'Advanced athlete', desc: '3+ years of systematic split training and logging overload.' }
                    ].map((exp) => (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => setExperienceLevel(exp.id)}
                        className={`p-4 rounded-lg border text-left flex flex-col gap-1 transition-all duration-200 ${
                          experienceLevel === exp.id 
                            ? 'bg-cyber-blue/10 border-cyber-blue/40 text-white' 
                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                        }`}
                      >
                        <span className="font-bold uppercase tracking-wider text-xs">{exp.label}</span>
                        <span className="text-[9px] text-gray-400 font-light leading-normal">{exp.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Workout Availability */}
              {currentStep === 4 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="flex flex-col gap-6 font-mono text-xs text-gray-400"
                >
                  <div>
                    <h3 className="text-base font-display font-black text-white uppercase tracking-wider">05 // Availability split</h3>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wide">Configure session frequency limits</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-[9px] uppercase tracking-wider font-bold">DAYS ACTIVE / WEEK</label>
                    <select 
                      value={workoutDays} onChange={(e) => setWorkoutDays(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none w-full"
                    >
                      <option value="2">2 Days (Metabolic Maintenance)</option>
                      <option value="3">3 Days (Full Body Split)</option>
                      <option value="4">4 Days (Upper / Lower Split)</option>
                      <option value="5">5 Days (Push / Pull / Legs Split)</option>
                      <option value="6">6 Days (Pro Athlete Cycle)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-[9px] uppercase tracking-wider font-bold">SESSION DURATION (MINUTES)</label>
                    <select 
                      value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none w-full"
                    >
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes</option>
                      <option value="75">75 Minutes</option>
                      <option value="90">90 Minutes</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Nutrition Preferences */}
              {currentStep === 5 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="flex flex-col gap-6 font-mono text-xs text-gray-400"
                >
                  <div>
                    <h3 className="text-base font-display font-black text-white uppercase tracking-wider">06 // Nutrition preferences</h3>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wide">Map target fuel source profiles</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { id: 'non_vegetarian', label: 'Non-Vegetarian', desc: 'Include poultry, beef, seafood, eggs, and dairy.' },
                      { id: 'vegetarian', label: 'Vegetarian split', desc: 'Dairy and eggs allowed. Zero meat sources.' },
                      { id: 'vegan', label: 'Strict Vegan', desc: '100% plant-based food sources. Zero animal byproducts.' }
                    ].map((diet) => (
                      <button
                        key={diet.id}
                        type="button"
                        onClick={() => setDietaryPreference(diet.id)}
                        className={`p-4 rounded-lg border text-left flex flex-col gap-1 transition-all duration-200 ${
                          dietaryPreference === diet.id 
                            ? 'bg-neon-green/10 border-neon-green/40 text-white' 
                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                        }`}
                      >
                        <span className="font-bold uppercase tracking-wider text-xs">{diet.label}</span>
                        <span className="text-[9px] text-gray-400 font-light leading-normal">{diet.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 7: Summary Page */}
              {currentStep === 6 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-6 font-mono text-xs text-gray-400"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-neon-green animate-pulse" />
                    </div>
                    <h3 className="text-base font-display font-black text-white uppercase tracking-wider">Metamorphosis Profile Ready</h3>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wide">Holographic calibration complete</p>
                  </div>

                  {/* Calculations Display */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                      <span className="text-[8px] text-gray-500 uppercase block mb-1">METABOLIC COST</span>
                      <span className="text-sm font-bold text-white font-mono">{tdee} kcal</span>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                      <span className="text-[8px] text-gray-500 uppercase block mb-1">TARGET CALORIES</span>
                      <span className="text-sm font-bold text-neon-green font-mono">{targetCalories} kcal</span>
                    </div>
                  </div>

                  {/* Timeline Split */}
                  <div className="bg-black/40 p-3.5 rounded-lg border border-white/5">
                    <span className="text-[8px] text-cyber-blue uppercase block mb-1.5 font-bold tracking-widest">// ESTIMATED PATH TIMELINE</span>
                    <span className="text-xs font-bold text-white block font-mono">{goalTimeline}</span>
                  </div>

                  {/* AI Recommendation dossier */}
                  <div className="bg-gradient-to-r from-cyber-blue/10 to-neon-green/10 p-4 rounded-lg border border-white/5 flex gap-3 items-start">
                    <Activity className="w-4 h-4 text-neon-green shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="text-[8px] text-neon-green tracking-widest uppercase block font-bold">SYNAPSE BLUEPRINT MEMO</span>
                      <p className="text-[10px] text-gray-300 font-light leading-relaxed mt-1 font-sans">
                        {aiRecommendation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 border-t border-white/5 pt-6 z-10">
              
              {currentStep > 0 && currentStep < 6 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isLoading}
                  className="px-5 py-3 border border-white/10 hover:bg-white/5 text-white font-mono uppercase tracking-wider rounded-lg transition-all text-[9px] pointer-events-auto"
                >
                  Previous
                </button>
              )}

              {/* Push layout spacing if previous is hidden */}
              {currentStep === 0 && <div />}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold font-mono uppercase tracking-wider rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-[9px] pointer-events-auto"
                >
                  Next Step
                </button>
              ) : currentStep === 5 ? (
                <button
                  type="button"
                  onClick={triggerCompilation}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold font-mono uppercase tracking-wider rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-[9px] flex items-center gap-2 pointer-events-auto"
                >
                  {isLoading ? (
                    <>
                      <Cpu className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling Plans...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Generate My Blueprint</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-4 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-black font-mono uppercase tracking-wider rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-[10px] flex items-center justify-center gap-2 pointer-events-auto cursor-none"
                >
                  Initialize System Core Terminal
                </button>
              )}

            </div>

          </div>
        </div>

        {/* Footer info notes */}
        <footer className="text-center font-mono text-[8px] text-gray-600 tracking-wider w-full mt-8 lg:mt-0">
          FITFORGE OS INITIALIZATION SECURE LINK PROMPT © 2026.
        </footer>

      </div>

    </div>
  );
}
