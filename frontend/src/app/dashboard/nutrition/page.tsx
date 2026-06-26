'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Cpu, RotateCw, Flame, Check, Apple, HelpCircle } from 'lucide-react';

interface Meal {
  id: string;
  type: string;
  name: string;
  description: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

interface NutritionPlan {
  _id: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dietaryPreference: string;
  meals: Meal[];
}

export default function NutritionDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  
  // Compliance tracking states
  const [loggedMeals, setLoggedMeals] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [swappingMealId, setSwappingMealId] = useState<string | null>(null);

  const fetchNutritionPlan = async () => {
    if (!user) return;
    try {
      const res = await fetch(`https://fitforge-production-0c79.up.railway.app/api/nutrition/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (err) {
      console.error('Error loading nutrition plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNutritionPlan();
    }
  }, [user]);

  // Generate full plan
  const handleRegeneratePlan = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await fetch('https://fitforge-production-0c79.up.railway.app/api/nutrition/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: user.id })
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Regenerate individual meal (swap)
  const handleRegenerateMeal = async (mealId: string) => {
    if (!plan) return;
    setSwappingMealId(mealId);
    try {
      const res = await fetch('https://fitforge-production-0c79.up.railway.app/api/nutrition/regenerate-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan._id,
          mealId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (err) {
      console.error('Meal swap failure:', err);
    } finally {
      setSwappingMealId(null);
    }
  };

  const toggleMealLog = (mealId: string) => {
    setLoggedMeals(prev => 
      prev.includes(mealId) ? prev.filter(id => id !== mealId) : [...prev, mealId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] font-mono text-xs text-cyber-blue gap-3">
        <Cpu className="w-5 h-5 animate-spin" />
        <span>STREAMING DIETARY ALGORITHM DOSSIER...</span>
      </div>
    );
  }

  // Calculate current intake totals based on checked meals
  let currentCalories = 0, currentP = 0, currentC = 0, currentF = 0;
  if (plan) {
    plan.meals.forEach((m) => {
      if (loggedMeals.includes(m.id)) {
        currentCalories += m.calories;
        currentP += m.protein;
        currentC += m.carbs;
        currentF += m.fats;
      }
    });
  }

  const calPercent = plan ? Math.min(100, Math.round((currentCalories / plan.calories) * 100)) : 0;
  const pPercent = plan ? Math.min(100, Math.round((currentP / plan.protein) * 100)) : 0;
  const cPercent = plan ? Math.min(100, Math.round((currentC / plan.carbs) * 100)) : 0;
  const fPercent = plan ? Math.min(100, Math.round((currentF / plan.fats) * 100)) : 0;

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Header Row */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-mono text-cyber-blue tracking-widest block uppercase">
            SECTION 03 // NUTRITION ENGINE
          </span>
          <h2 className="text-2xl font-display font-black text-white tracking-tight leading-none mt-1">
            Macro-Nutrient Fuel Cycles
          </h2>
        </div>

        <button
          onClick={handleRegeneratePlan}
          disabled={generating}
          className="px-4 py-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue hover:text-black rounded font-mono text-[9px] tracking-widest uppercase transition-all duration-300 pointer-events-auto"
        >
          {generating ? 'Recompiling Meals...' : 'Regenerate Plan'}
        </button>
      </div>

      {plan ? (
        <div className="flex flex-col gap-8">
          
          {/* 2. Macro Tracking Panel */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />
            
            <div className="z-10 flex flex-col gap-6 w-full">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                DAILY COMPLIANCE PROGRESS GAUGE
              </span>

              {/* Progress bars grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Calories circular radial lookalike (as progress bar) */}
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">ENERGY BUDGET</span>
                    <span className="text-2xl font-mono font-bold text-white">{currentCalories} / {plan.calories}</span>
                    <span className="text-[8px] font-mono text-gray-400 block mt-0.5">kcal limit target</span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-neon-green" style={{ width: `${calPercent}%` }} />
                  </div>
                  <span className="text-[8px] font-mono text-neon-green mt-2 text-right block">{calPercent}% MET</span>
                </div>

                {/* Protein */}
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">SOMATIC PROTEIN</span>
                    <span className="text-xl font-mono font-bold text-white">{currentP} / {plan.protein}g</span>
                    <span className="text-[8px] font-mono text-gray-400 block mt-0.5">Muscular synthesis target</span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-cyber-blue" style={{ width: `${pPercent}%` }} />
                  </div>
                  <span className="text-[8px] font-mono text-cyber-blue mt-2 text-right block">{pPercent}% SYNTH</span>
                </div>

                {/* Carbs */}
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">GLYCOGEN FUEL</span>
                    <span className="text-xl font-mono font-bold text-white">{currentC} / {plan.carbs}g</span>
                    <span className="text-[8px] font-mono text-gray-400 block mt-0.5">Anaerobic glycogen reload</span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-neon-green" style={{ width: `${cPercent}%` }} />
                  </div>
                  <span className="text-[8px] font-mono text-neon-green mt-2 text-right block">{cPercent}% FUEL</span>
                </div>

                {/* Fats */}
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">HORMONAL LIPIDS</span>
                    <span className="text-xl font-mono font-bold text-white">{currentF} / {plan.fats}g</span>
                    <span className="text-[8px] font-mono text-gray-400 block mt-0.5">Endocrine health budget</span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-cyber-blue" style={{ width: `${fPercent}%` }} />
                  </div>
                  <span className="text-[8px] font-mono text-cyber-blue mt-2 text-right block">{fPercent}% COMPL</span>
                </div>

              </div>

            </div>
          </div>

          {/* 3. Meals Grid */}
          <div>
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-4">
              PERSONALIZED DAILY DIET LAYOUT
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.meals.map((meal) => {
                const isLogged = loggedMeals.includes(meal.id);
                const isSwapping = swappingMealId === meal.id;

                return (
                  <div
                    key={meal.id}
                    className={`glass-panel p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between min-h-[220px] ${
                      isLogged ? 'border-neon-green/30 shadow-lg shadow-neon-green/5' : 'border-white/5'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-neon-green uppercase font-bold tracking-widest">
                          {meal.type}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1 uppercase tracking-wide">
                          {meal.name}
                        </h4>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Swap Meal Button */}
                        <button
                          type="button"
                          onClick={() => handleRegenerateMeal(meal.id)}
                          disabled={isSwapping}
                          className="p-2 rounded bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
                          title="Generate a different AI option for this meal"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${isSwapping ? 'animate-spin text-neon-green' : ''}`} />
                        </button>

                        {/* Check complete meal */}
                        <button
                          type="button"
                          onClick={() => toggleMealLog(meal.id)}
                          className={`w-8 h-8 rounded flex items-center justify-center border transition-all pointer-events-auto ${
                            isLogged 
                              ? 'bg-neon-green border-neon-green text-black' 
                              : 'border-white/10 hover:border-white/20 text-gray-500 hover:text-white'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meal description */}
                    <p className="text-xs text-gray-400 font-light leading-relaxed my-4">
                      {meal.description}
                    </p>

                    {/* Macros info */}
                    <div className="border-t border-white/5 pt-3 flex justify-between items-center font-mono text-[9px] text-gray-400">
                      <div className="flex gap-3">
                        <div>P: <span className="text-white font-bold">{meal.protein}g</span></div>
                        <div>C: <span className="text-white font-bold">{meal.carbs}g</span></div>
                        <div>F: <span className="text-white font-bold">{meal.fats}g</span></div>
                      </div>
                      <span className="text-neon-green font-bold bg-neon-green/5 px-2 py-0.5 rounded border border-neon-green/10">
                        {meal.calories} kcal
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 text-center flex flex-col items-center gap-4">
          <Apple className="w-8 h-8 text-gray-500 animate-pulse" />
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">No active nutrition plan loaded.</h3>
          <button 
            onClick={handleRegeneratePlan}
            className="px-6 py-3 bg-cyber-blue text-black font-mono text-[10px] font-bold tracking-widest uppercase rounded-lg hover:scale-102 transition-all"
          >
            Generate AI Meals
          </button>
        </div>
      )}

    </div>
  );
}
