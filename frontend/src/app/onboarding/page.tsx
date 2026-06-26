'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Cpu, Send, ShieldAlert, CheckCircle, Scale, Dumbbell } from 'lucide-react';

export default function Onboarding() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // Current step index (0-3)
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

  // Redirect if profile already exists (optional safety checks)
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  const toggleEquipment = (eq: string) => {
    setAvailableEquipment(prev => 
      prev.includes(eq) ? prev.filter(item => item !== eq) : [...prev, eq]
    );
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Success, route to dashboard
      router.push('/dashboard');
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
        <span>INITIALIZING FITFORGE SECURE LINK...</span>
      </div>
    );
  }

  const completionPercent = Math.round(((currentStep + 1) / 4) * 100);

  return (
    <div className="relative min-h-screen w-full bg-dark-bg flex flex-col justify-center items-center py-16 px-4 sm:px-6 overflow-hidden">
      
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-blue opacity-5 blur-[180px] pointer-events-none" />
      
      {/* Cyber Grid background */}
      <div className="absolute inset-0 cyber-grid opacity-[0.01] pointer-events-none" />

      {/* Main Glass Panel Card */}
      <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-cyber-blue/20 relative z-10">
        
        {/* Header progress bar */}
        <div className="flex justify-between items-center mb-6 font-mono text-[9px] text-gray-500">
          <span>FITFORGE // PILOT ONBOARDING</span>
          <span className="text-neon-green">{completionPercent}% COMPLETE</span>
        </div>

        <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyber-blue to-neon-green" 
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-800 text-red-400 p-3 rounded-lg flex items-center gap-2 mb-6 font-mono text-[10px]">
            <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Core Biometrics */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5 font-mono text-xs text-gray-400"
              >
                <div className="text-center mb-2">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">Biometric Parameters</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Skeletal dimensions calibration</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label>AGE (YEARS)</label>
                    <input 
                      type="number" required min="14" max="90" value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label>GENDER</label>
                    <select 
                      value={gender} onChange={(e) => setGender(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none"
                    >
                      <option value="male">MALE</option>
                      <option value="female">FEMALE</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label>HEIGHT (CM)</label>
                    <input 
                      type="number" required min="100" max="250" value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label>WEIGHT (KG)</label>
                    <input 
                      type="number" required min="35" max="220" value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Training Goals & Experience */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5 font-mono text-xs text-gray-400"
              >
                <div className="text-center mb-2">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">Target Path</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Calibrate neural focus and starting capacity</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label>COMPOSITION GOAL</label>
                  <select 
                    value={goal} onChange={(e) => setGoal(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none"
                  >
                    <option value="lose_fat">LIPID REDUCTION (FAT LOSS)</option>
                    <option value="build_muscle">MYOFIBRILLAR HYPERTROPHY (MUSCLE GAIN)</option>
                    <option value="recomposition">BODY RECOMPOSITION (LEAN BULK/TONE)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label>EXPERIENCE LEVEL</label>
                  <select 
                    value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none"
                  >
                    <option value="beginner">BEGINNER (UNDER 1 YEAR CONSISTENCY)</option>
                    <option value="intermediate">INTERMEDIATE (1-3 YEARS CONSISTENT LIFTS)</option>
                    <option value="advanced">ADVANCED (3+ YEARS HEAVY PROGRESSIVE OVERLOAD)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label>METABOLIC ACTIVITY LEVEL</label>
                  <select 
                    value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none"
                  >
                    <option value="sedentary">SEDENTARY (METABOLIC DESK WORK)</option>
                    <option value="light">LIGHTLY ACTIVE (MINOR COMMUTE STEPS)</option>
                    <option value="moderate">MODERATELY ACTIVE (3-4 ACTIVE SESSIONS/WEEK)</option>
                    <option value="active">HEAVY WORKLOAD (5-6 SPORTS SESSIONS/WEEK)</option>
                    <option value="very_active">ATHLETIC DISSIPATION (DAILY TRAINING OVERLOAD)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 3: Workload & Equipment */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5 font-mono text-xs text-gray-400"
              >
                <div className="text-center mb-2">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">Workload capacity</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Define training splits and gear parameters</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label>TRAINING DAYS / WEEK</label>
                    <select 
                      value={workoutDays} onChange={(e) => setWorkoutDays(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue"
                    >
                      <option value="2">2 DAYS (MAINTENANCE)</option>
                      <option value="3">3 DAYS (FULL BODY)</option>
                      <option value="4">4 DAYS (UPPER/LOWER)</option>
                      <option value="5">5 DAYS (PUSH/PULL/LEGS)</option>
                      <option value="6">6 DAYS (ATHLETIC CYCLE)</option>
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label>SESSION LENGTH (MINS)</label>
                    <select 
                      value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue"
                    >
                      <option value="45">45 MINS</option>
                      <option value="60">60 MINS</option>
                      <option value="75">75 MINS</option>
                      <option value="90">90 MINS</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label>AVAILABLE EQUIPMENT</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { id: 'gym', label: 'Commercial Gym' },
                      { id: 'barbells', label: 'Barbells' },
                      { id: 'dumbbells', label: 'Dumbbells' },
                      { id: 'bodyweight', label: 'Bodyweight Only' }
                    ].map(eq => (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() => toggleEquipment(eq.id)}
                        className={`p-3 rounded-lg border text-left flex justify-between items-center transition-all duration-200 ${
                          availableEquipment.includes(eq.id) 
                            ? 'bg-neon-green/10 border-neon-green/40 text-white' 
                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                        }`}
                      >
                        <span>{eq.label}</span>
                        {availableEquipment.includes(eq.id) && <CheckCircle className="w-3.5 h-3.5 text-neon-green" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Dietary & Injuries */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5 font-mono text-xs text-gray-400"
              >
                <div className="text-center mb-2">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">Fuel & Safety</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Diet preferences and injury history</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label>DIETARY PROFILE</label>
                  <select 
                    value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none"
                  >
                    <option value="non_vegetarian">NON-VEGETARIAN (WESTERN MIX)</option>
                    <option value="vegetarian">VEGETARIAN (EGG/DAIRY INCLUDED)</option>
                    <option value="vegan">VEGAN (STRICT PLANT BASE)</option>
                    <option value="indian_veg">INDIAN VEGETARIAN (LENTILS & PANEER FOCUS)</option>
                    <option value="indian_non_veg">INDIAN NON-VEGETARIAN (CURRY CHICKEN & DAAL)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label>INJURIES OR PHYSICAL RESTRICTIONS</label>
                  <textarea
                    value={injuries}
                    onChange={(e) => setInjuries(e.target.value)}
                    placeholder="e.g. Lower back L4 disc bulge, shoulder impingement, none"
                    className="bg-white/5 border border-white/10 rounded-lg p-3 text-white h-24 focus:border-cyber-blue focus:outline-none resize-none font-mono text-xs"
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8 border-t border-white/5 pt-6 z-10">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isLoading}
                className="px-6 py-3 border border-white/10 hover:bg-white/5 text-white font-mono uppercase tracking-wider rounded-lg transition-all text-[10px]"
              >
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold font-mono uppercase tracking-wider rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px]"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold font-mono uppercase tracking-wider rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling Plans...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit Metrics</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>

    </div>
  );
}
