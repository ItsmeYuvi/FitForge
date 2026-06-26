'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, RotateCcw, Send, Calendar, Flame, ChevronRight, Activity, Sparkles } from 'lucide-react';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface Meal {
  name: string;
  description: string;
  macros: string;
}

interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  advice: string;
  meals: Meal[];
}

interface Prediction {
  day: number;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  status: string;
}

interface BlueprintResponse {
  bmi: number;
  bodyFatEst: number;
  bmr: number;
  tdee: number;
  healthAnalysis: string;
  workoutPlan: WorkoutDay[];
  nutritionPlan: NutritionPlan;
  predictions: Prediction[];
}

export default function CTA() {
  // Navigation states: 'cta' -> 'form' -> 'scanning' -> 'results'
  const [step, setStep] = useState<'cta' | 'form' | 'scanning' | 'results'>('cta');
  
  // Form states
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('180');
  const [weight, setWeight] = useState('78');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('lose_fat');

  // Blueprint results states
  const [blueprint, setBlueprint] = useState<BlueprintResponse | null>(null);
  const [activeDay, setActiveDay] = useState<number>(0);
  const [resultsTab, setResultsTab] = useState<'workout' | 'nutrition' | 'predictions'>('workout');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('scanning');

    // Simulate cyber-scan processing lag for premium feel
    setTimeout(async () => {
      try {
        const response = await fetch('https://fitforge-production-0c79.up.railway.app/api/blueprint/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            age: Number(age),
            gender,
            height: Number(height),
            weight: Number(weight),
            activityLevel,
            goal,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBlueprint(data);
          setStep('results');
        } else {
          // Fail-safe local fallback trigger if backend is down
          console.warn('Backend server unreached, compiling offline metrics.');
          throw new Error('Server unreachable');
        }
      } catch (err) {
        // Build direct client-side fallback blueprint
        const calculatedBmi = parseFloat((Number(weight) / ((Number(height) / 100) * (Number(height) / 100))).toFixed(1));
        const estimatedFat = gender === 'male' ? Math.max(3, 1.20 * calculatedBmi + 0.23 * Number(age) - 16.2) : Math.max(8, 1.20 * calculatedBmi + 0.23 * Number(age) - 5.4);
        const bmrVal = gender === 'male' ? 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5 : 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161;
        const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
        const tdeeVal = Math.round(bmrVal * (multipliers[activityLevel] || 1.2));
        
        let calories = tdeeVal;
        if (goal === 'lose_fat') calories -= 450;
        else if (goal === 'build_muscle') calories += 300;

        const protein = Math.round(Number(weight) * 2.2);
        const fats = Math.round(Number(weight) * 0.9);
        const carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);

        setBlueprint({
          bmi: parseFloat(calculatedBmi.toFixed(1)),
          bodyFatEst: parseFloat(estimatedFat.toFixed(1)),
          bmr: Math.round(bmrVal),
          tdee: tdeeVal,
          healthAnalysis: `Biometrics validated. Your skeletal index shows optimal training capacity. A daily calorie budget of ${calories} kcal is configured to trigger safe composition adjustments.`,
          workoutPlan: [
            {
              day: 'Monday',
              focus: 'Full Body Overload',
              exercises: [
                { name: 'Squats', sets: 4, reps: '8-10 reps', rest: '90s', notes: 'Maintain depth.' },
                { name: 'Bench Press', sets: 4, reps: '8 reps', rest: '90s', notes: 'Squeeze pecs.' },
                { name: 'Lat Pulldowns', sets: 3, reps: '10-12 reps', rest: '60s', notes: 'Focus on pull.' }
              ]
            },
            {
              day: 'Tuesday',
              focus: 'Cardiovascular Workload',
              exercises: [
                { name: 'Incline Jogging', sets: 1, reps: '30 mins', rest: 'N/A', notes: 'Speed 5.5mph, incline 6%.' }
              ]
            },
            {
              day: 'Wednesday',
              focus: 'Posterior Overload',
              exercises: [
                { name: 'Deadlifts', sets: 3, reps: '6 reps', rest: '120s', notes: 'Keep spine flat.' },
                { name: 'Hamstring Curls', sets: 3, reps: '12 reps', rest: '60s', notes: 'Contract hard.' }
              ]
            },
            {
              day: 'Thursday',
              focus: 'Active Rest',
              exercises: [
                { name: 'Outdoor walking', sets: 1, reps: '40 mins', rest: 'N/A', notes: 'Relax muscle tension.' }
              ]
            },
            {
              day: 'Friday',
              focus: 'Upper Push-Pull Focus',
              exercises: [
                { name: 'Dumbbell Press', sets: 4, reps: '10 reps', rest: '75s', notes: 'Elbows at 45 degrees.' },
                { name: 'Seated Rows', sets: 3, reps: '12 reps', rest: '60s', notes: 'Squeeze shoulder blades.' }
              ]
            },
            {
              day: 'Saturday',
              focus: 'Core Stabilizer Split',
              exercises: [
                { name: 'Plank Holds', sets: 3, reps: '60s hold', rest: '30s', notes: 'Glutes engaged.' }
              ]
            },
            {
              day: 'Sunday',
              focus: 'Rest & Recovery',
              exercises: [
                { name: 'Deep stretching', sets: 1, reps: '20 mins', rest: 'N/A', notes: 'Focus on breathing.' }
              ]
            }
          ],
          nutritionPlan: {
            calories,
            protein,
            carbs,
            fats,
            advice: 'Increase hydration to 3.5 liters. Prioritize lean protein sources.',
            meals: [
              { name: 'Breakfast', description: 'Eggs, oatmeal, blueberries', macros: `${Math.round(protein * 0.25)}g P / ${Math.round(carbs * 0.25)}g C` },
              { name: 'Lunch', description: 'Chicken, rice, broccoli', macros: `${Math.round(protein * 0.35)}g P / ${Math.round(carbs * 0.35)}g C` },
              { name: 'Snack', description: 'Protein shake, almonds', macros: `${Math.round(protein * 0.15)}g P / 10g C` },
              { name: 'Dinner', description: 'Salmon, sweet potatoes', macros: `${Math.round(protein * 0.25)}g P / ${Math.round(carbs * 0.2)}g C` }
            ]
          },
          predictions: [
            { day: 30, weight: Number(weight) - 1.5, bodyFat: estimatedFat - 1, muscleMass: Number(weight) * (1 - estimatedFat/100), status: 'Initial load threshold met.' },
            { day: 60, weight: Number(weight) - 3, bodyFat: estimatedFat - 2, muscleMass: Number(weight) * (1 - estimatedFat/100), status: 'Neuromuscular peak reached.' },
            { day: 90, weight: Number(weight) - 4.5, bodyFat: estimatedFat - 3, muscleMass: Number(weight) * (1 - estimatedFat/100), status: 'Optimized twin unlocked.' }
          ]
        });
        setStep('results');
      }
    }, 2800);
  };

  const handleReset = () => {
    setStep('cta');
    setBlueprint(null);
  };

  return (
    <section id="blueprint-generator" className="relative w-full h-screen snap-start snap-always py-24 px-6 sm:px-12 md:px-24 flex items-center justify-center overflow-hidden z-20 shrink-0 select-none">
      
      {/* Background blur flares */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-green opacity-5 blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          
          {/* Step 1: Initial CTA Section */}
          {step === 'cta' && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="text-center flex flex-col gap-8 max-w-4xl z-10"
            >
              <span className="text-xs font-mono tracking-[0.2em] text-cyber-blue uppercase">
                // METAMORPHOSIS INITIATION //
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tight text-white leading-[0.95]">
                Start Building Tomorrow&apos;s Body Today
              </h2>
              <p className="text-sm sm:text-base text-gray-400 font-light max-w-xl mx-auto">
                Transmit your skeletal vectors and goal index parameters. Our neural core will compile a progressive overload training blueprint and synchronized macro schedule.
              </p>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setStep('form')}
                  data-cursor-text="START SCAN"
                  className="px-10 py-5 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-semibold text-xs tracking-widest uppercase rounded-lg hover:shadow-lg hover:shadow-cyber-blue/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 pointer-events-auto"
                >
                  Generate My Plan
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Biometric Form */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl glass-panel p-8 rounded-2xl border border-cyber-blue/30 z-10"
            >
              <h3 className="text-lg font-bold text-white tracking-wider mb-6 text-center uppercase font-display">
                Biometric Input Vector Configuration
              </h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-mono text-xs">
                
                {/* Age & Gender Row */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-gray-500 tracking-wider">AGE (YEARS)</label>
                    <input
                      type="number"
                      required
                      min="15"
                      max="80"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none transition-all duration-300"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-gray-500 tracking-wider">GENDER</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none transition-all duration-300"
                    >
                      <option value="male">MALE</option>
                      <option value="female">FEMALE</option>
                    </select>
                  </div>
                </div>

                {/* Height & Weight Row */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-gray-500 tracking-wider">HEIGHT (CM)</label>
                    <input
                      type="number"
                      required
                      min="120"
                      max="220"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none transition-all duration-300"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-gray-500 tracking-wider">WEIGHT (KG)</label>
                    <input
                      type="number"
                      required
                      min="40"
                      max="180"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Activity level */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 tracking-wider">ACTIVITY COEFFICIENT</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none transition-all duration-300"
                  >
                    <option value="sedentary">SEDENTARY (METABOLIC BASELINE ONLY)</option>
                    <option value="light">LIGHT (1-2 SESSIONS WEEKLY)</option>
                    <option value="moderate">MODERATE (3-4 SESSIONS WEEKLY)</option>
                    <option value="active">ACTIVE (5-6 SESSIONS WEEKLY)</option>
                    <option value="very_active">VERY ACTIVE (DAILY ATHLETIC WORKLOAD)</option>
                  </select>
                </div>

                {/* Goal split */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 tracking-wider">TARGET COMPOSITION GOAL</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg p-3 text-white focus:border-cyber-blue focus:outline-none transition-all duration-300"
                  >
                    <option value="lose_fat">LIPID OXIDIZATION (DEFICIT)</option>
                    <option value="build_muscle">MYOFIBRILLAR HYPERTROPHY (SURPLUS)</option>
                    <option value="build_strength">MAXIMUM KINETIC POWER (STRENGTH)</option>
                    <option value="endurance">VO2 MAX CAPACITY (ENDURANCE)</option>
                    <option value="maintenance">METABOLIC HOMEOSTASIS (MAINTENANCE)</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  data-cursor-text="TRANSMIT"
                  className="w-full py-4 mt-4 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold text-xs tracking-widest uppercase rounded-lg hover:shadow-lg hover:shadow-neon-green/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 pointer-events-auto flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Transmit Data for Neural Scan
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Neural scanning screen */}
          {step === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-md text-center z-10"
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Rotating holographic rings */}
                <div className="absolute inset-0 rounded-full border border-dashed border-cyber-blue animate-spin" />
                <div className="absolute inset-2 rounded-full border border-double border-neon-green animate-[spin_4s_linear_infinite_reverse]" />
                <Cpu className="w-8 h-8 text-cyber-blue animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-white tracking-widest uppercase">
                  CALIBRATING BIO-METRIC MATRIX
                </h3>
                <span className="text-[10px] font-mono text-gray-500 tracking-widest block mt-2">
                  RUNNING METABOLIC FORMULAS...
                </span>
              </div>
              {/* Matrix-like scanner progress log */}
              <div className="glass-panel p-4 rounded-xl border border-white/5 font-mono text-[9px] text-gray-400 w-64 text-left flex flex-col gap-1 shadow-inner">
                <div>[SYSTEM] Reading height/weight ratio...</div>
                <div>[SYSTEM] Estimating hormonal lipid coefficient...</div>
                <div>[SYSTEM] Compiling Mifflin-St Jeor index...</div>
                <div className="text-neon-green animate-pulse">[SYSTEM] Running OpenRouter synapse query...</div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Digital twin results dashboard */}
          {step === 'results' && blueprint && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-5xl glass-panel p-6 sm:p-8 rounded-2xl border border-neon-green/30 z-10 flex flex-col gap-8 relative"
            >
              {/* Reset button */}
              <button
                onClick={handleReset}
                data-cursor-text="RESET"
                className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white pointer-events-auto transition-all duration-300"
                title="Reset simulation parameters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Top Row: Metrics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">BMI LEVEL</span>
                  <span className="text-xl font-mono font-bold text-cyber-blue">{blueprint.bmi}</span>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">ESTIMATED FAT</span>
                  <span className="text-xl font-mono font-bold text-neon-green">{blueprint.bodyFatEst}%</span>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">BMR (IDLE COST)</span>
                  <span className="text-xl font-mono font-bold text-white">{blueprint.bmr} kcal</span>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">TDEE BUDGET</span>
                  <span className="text-xl font-mono font-bold text-neon-green">{blueprint.tdee} kcal</span>
                </div>
              </div>

              {/* AI synthesis banner */}
              <div className="bg-gradient-to-r from-cyber-blue/10 to-neon-green/10 p-5 rounded-xl border border-white/5 flex gap-4 items-start">
                <Sparkles className="w-5 h-5 text-neon-green mt-0.5 shrink-0 animate-pulse" />
                <div>
                  <span className="text-[9px] font-mono text-neon-green tracking-widest block mb-1">
                    AI INTEGRATION SYNAPSE DOSSIER
                  </span>
                  <p className="text-xs text-gray-300 font-light leading-relaxed">
                    {blueprint.healthAnalysis}
                  </p>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="flex gap-4 border-b border-white/5 pb-2">
                {['workout', 'nutrition', 'predictions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setResultsTab(tab as any)}
                    data-cursor-text="SWITCH"
                    className={`pb-2 px-1 font-mono text-[10px] uppercase tracking-widest border-b-2 pointer-events-auto transition-all duration-300 ${
                      resultsTab === tab ? 'border-neon-green text-neon-green font-bold' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    {tab === 'workout' ? 'Workout split' : tab === 'nutrition' ? 'Nutrition Engine' : '90-Day Predictions'}
                  </button>
                ))}
              </div>

              {/* Sub-tab view panels */}
              <div className="min-h-[300px]">
                
                {/* 1. WORKOUT MAP VIEW */}
                {resultsTab === 'workout' && (
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Day selector sidebar */}
                    <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 md:w-40 shrink-0">
                      {blueprint.workoutPlan.map((pDay, idx) => (
                        <button
                          key={pDay.day}
                          onClick={() => setActiveDay(idx)}
                          data-cursor-text="VIEW"
                          className={`p-3 text-left font-mono text-[10px] rounded-lg border transition-all duration-300 pointer-events-auto shrink-0 ${
                            activeDay === idx
                              ? 'bg-neon-green/10 border-neon-green/40 text-neon-green font-bold'
                              : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {pDay.day}
                        </button>
                      ))}
                    </div>

                    {/* Day exercise split details */}
                    <div className="flex-1 glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-neon-green uppercase">TARGET TRAINING DAY</span>
                            <h4 className="text-base font-bold text-white mt-1">
                              {blueprint.workoutPlan[activeDay].day} // {blueprint.workoutPlan[activeDay].focus}
                            </h4>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-cyber-blue" />
                          </div>
                        </div>

                        {/* Exercises list */}
                        <div className="flex flex-col gap-3">
                          {blueprint.workoutPlan[activeDay].exercises.map((ex, eIdx) => (
                            <div key={eIdx} className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-3">
                              <div>
                                <span className="text-xs font-bold text-white block">{ex.name}</span>
                                {ex.notes && <span className="text-[9px] text-gray-500 font-mono block mt-0.5">Note: {ex.notes}</span>}
                              </div>
                              <div className="flex gap-4 font-mono text-[10px] text-gray-400">
                                <div>Sets: <span className="text-white font-bold">{ex.sets}</span></div>
                                <div>Reps: <span className="text-white font-bold">{ex.reps}</span></div>
                                <div>Rest: <span className="text-white font-bold">{ex.rest}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. NUTRITION ENGINE DETAILS */}
                {resultsTab === 'nutrition' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Macros Summary */}
                    <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                      <div className="flex flex-col gap-4">
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                          NUTRITIONAL FUEL SPECS
                        </span>
                        
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                          <span className="text-xs text-gray-400">DAILY CALORIES</span>
                          <span className="text-xl font-mono font-bold text-neon-green">{blueprint.nutritionPlan.calories} kcal</span>
                        </div>

                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                          <span className="text-xs text-gray-400">PROTEIN BUDGET</span>
                          <span className="text-sm font-mono text-white">{blueprint.nutritionPlan.protein} g</span>
                        </div>

                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                          <span className="text-xs text-gray-400">CARBS BUDGET</span>
                          <span className="text-sm font-mono text-white">{blueprint.nutritionPlan.carbs} g</span>
                        </div>

                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                          <span className="text-xs text-gray-400">LIPID TARGET</span>
                          <span className="text-sm font-mono text-white">{blueprint.nutritionPlan.fats} g</span>
                        </div>
                      </div>

                      <div className="bg-white/5 p-3 rounded-lg border border-white/5 mt-6 flex items-start gap-2">
                        <Flame className="w-4 h-4 text-cyber-blue mt-0.5 shrink-0" />
                        <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                          {blueprint.nutritionPlan.advice}
                        </p>
                      </div>
                    </div>

                    {/* Right: Daily Meal splits (2 cols) */}
                    <div className="md:col-span-2 glass-panel p-5 rounded-xl border border-white/5">
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-4">
                        SYNCHRONIZED MEALS PLAN
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {blueprint.nutritionPlan.meals.map((meal, mIdx) => (
                          <div key={mIdx} className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">{meal.name}</span>
                              <span className="font-mono text-[9px] text-neon-green bg-neon-green/5 px-2 py-0.5 rounded border border-neon-green/10">
                                {meal.macros}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-normal font-light">
                              {meal.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. 90-DAY PREDICTIVE TWIN */}
                {resultsTab === 'predictions' && (
                  <div className="flex flex-col gap-6">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                      PREDICTED PHYSICAL EVOLUTION SLOPE
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {blueprint.predictions.map((p, pIdx) => (
                        <div key={p.day} className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col gap-4 relative">
                          <span className="absolute top-4 right-4 font-mono text-[9px] text-gray-500">
                            PHASE {pIdx === 0 ? 'ALPHA' : pIdx === 1 ? 'BETA' : 'OMEGA'}
                          </span>
                          <div>
                            <span className="text-xs font-mono text-neon-green font-bold block mb-1">
                              DAY {p.day}
                            </span>
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                                <span>WEIGHT</span>
                                <span className="text-white font-bold">{p.weight} kg</span>
                              </div>
                              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                                <span>BODY FAT</span>
                                <span className="text-white font-bold">{p.bodyFat}%</span>
                              </div>
                              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                                <span>MUSCLE MASS</span>
                                <span className="text-white font-bold">{Math.round(p.muscleMass)} kg</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex gap-2 items-start mt-2">
                            <Activity className="w-4 h-4 text-cyber-blue shrink-0 animate-pulse" />
                            <span className="text-[10px] text-gray-400 leading-tight font-light">
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </section>
  );
}
