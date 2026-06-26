'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Cpu, Calendar, Flame, FlameKindling, Zap, Award, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface WeeklyReview {
  workoutConsistencyScore: number;
  nutritionConsistencyScore: number;
  review: {
    summary: string;
    improvements: string[];
    adjustments: string[];
  };
}

interface WorkoutDay {
  day: string;
  focus: string;
}

interface Meal {
  type: string;
  name: string;
  calories: number;
}

export default function DashboardOverview() {
  const { user } = useUser();
  const router = useRouter();
  
  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutDay | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  
  // Check-in form states
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [weight, setWeight] = useState('');
  const [sleepHours, setSleepHours] = useState('8');
  const [energyLevel, setEnergyLevel] = useState('8');
  const [mood, setMood] = useState('focused');
  const [waterIntake, setWaterIntake] = useState('3.0');
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [submittingCheckin, setSubmittingCheckin] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const clerkId = user.id;

      // 1. Fetch Profile. If not found, redirect to Onboarding
      const profileRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/onboarding/${clerkId}`);
      if (profileRes.status === 404) {
        router.push('/onboarding');
        return;
      }
      const profileData = await profileRes.json();
      setProfile(profileData);
      setWeight(profileData.weight.toString());

      // 2. Fetch Weekly Review
      const reviewRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/progress/weekly-review/${clerkId}`);
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        setWeeklyReview(reviewData);
      }

      // 3. Fetch Workout Plan (to isolate today's split)
      const workoutRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/workout/${clerkId}`);
      if (workoutRes.ok) {
        const workoutData = await workoutRes.json();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = weekdays[new Date().getDay()];
        const todayPlan = workoutData.workoutPlan.find((d: any) => d.day === currentDayName);
        setTodayWorkout(todayPlan || { day: currentDayName, focus: 'Active Recovery' });
      }

      // 4. Fetch Nutrition Plan (to show daily macros targets)
      const nutritionRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/nutrition/${clerkId}`);
      if (nutritionRes.ok) {
        const nutritionData = await nutritionRes.json();
        setTodayMeals(nutritionData.meals || []);
      }

    } catch (err) {
      console.error('Error fetching dashboard overview logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingCheckin(true);
    setCheckinSuccess(false);

    try {
      const res = await fetch('https://fitforge-production-0c79.up.railway.app/api/progress/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          weight: Number(weight),
          sleepHours: Number(sleepHours),
          energyLevel: Number(energyLevel),
          mood,
          waterIntake: Number(waterIntake)
        })
      });

      if (res.ok) {
        setCheckinSuccess(true);
        setTimeout(() => {
          setShowCheckinForm(false);
          setCheckinSuccess(false);
          // Reload dashboard stats
          fetchDashboardData();
        }, 1500);
      }
    } catch (err) {
      console.error('Checkin failure:', err);
    } finally {
      setSubmittingCheckin(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] font-mono text-xs text-cyber-blue gap-3">
        <Cpu className="w-5 h-5 animate-spin" />
        <span>STREAMING SYSTEM OVERVIEW DOSSIER...</span>
      </div>
    );
  }

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayLabel = weekdays[new Date().getDay()];

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono text-neon-green tracking-widest block uppercase">
            FITFORGE AI // CORE OPERATING SYSTEM
          </span>
          <h2 className="text-3xl font-display font-black text-white tracking-tight leading-none mt-1">
            Welcome back, {user?.firstName || 'User'}
          </h2>
        </div>

        <button
          onClick={() => setShowCheckinForm(true)}
          data-cursor-text="LOG STATS"
          className="px-5 py-3 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-mono font-semibold text-[10px] tracking-widest uppercase rounded-lg hover:scale-[1.03] active:scale-[0.98] transition-all pointer-events-auto shadow-lg shadow-neon-green/5"
        >
          Daily Check-in
        </button>
      </div>

      {/* Checkin modal popup */}
      {showCheckinForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-6 rounded-2xl border border-neon-green/30 relative"
          >
            {checkinSuccess ? (
              <div className="flex flex-col items-center gap-4 text-center py-8">
                <CheckCircle className="w-12 h-12 text-neon-green animate-bounce" />
                <span className="font-mono text-xs text-neon-green tracking-widest uppercase block">
                  TRANSMISSION COMPLETE. BIO-METRIC SYSTEM SYNCHRONIZED.
                </span>
              </div>
            ) : (
              <form onSubmit={handleCheckinSubmit} className="flex flex-col gap-5 font-mono text-xs">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">DAILY CHECK-IN LOG</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowCheckinForm(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    CLOSE [X]
                  </button>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-gray-500 text-[10px]">WEIGHT (KG)</label>
                    <input 
                      type="number" step="0.1" required value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-gray-500 text-[10px]">SLEEP (HOURS)</label>
                    <input 
                      type="number" required value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-gray-500 text-[10px]">ENERGY (1-10)</label>
                    <input 
                      type="number" min="1" max="10" required value={energyLevel}
                      onChange={(e) => setEnergyLevel(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-gray-500 text-[10px]">WATER (LITERS)</label>
                    <input 
                      type="number" step="0.1" required value={waterIntake}
                      onChange={(e) => setWaterIntake(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 text-[10px]">MOOD STATE</label>
                  <select 
                    value={mood} onChange={(e) => setMood(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg p-2.5 text-white"
                  >
                    <option value="focused">FOCUSED (CALIBRATED FOCUS)</option>
                    <option value="energetic">ENERGETIC (SURPLUS INTENSITY)</option>
                    <option value="stable">STABLE (STANDARD BASELINE)</option>
                    <option value="fatigued">FATIGUED (RECOVERY OVERLOAD)</option>
                    <option value="stressed">STRESSED (CORTISOL PEAK)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingCheckin}
                  className="w-full py-3 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold uppercase text-[10px] tracking-widest rounded-lg flex justify-center items-center gap-2 mt-2"
                >
                  {submittingCheckin ? 'TRANSMITTING...' : 'TRANSMIT CHECK-IN'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* 2. Top Metric Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1">BIOMETRIC WEIGHT</span>
          <span className="text-2xl font-mono font-bold text-white">{profile?.weight} kg</span>
          <span className="text-[8px] font-mono text-gray-400 block mt-1">Goal: {profile?.goal === 'lose_fat' ? 'Deficit Mode' : 'Surplus Mode'}</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex justify-between items-center">
          <div>
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1">COMPLIANCE STREAK</span>
            <span className="text-2xl font-mono font-bold text-neon-green">5 DAYS</span>
            <span className="text-[8px] font-mono text-gray-400 block mt-1">Active overload logs</span>
          </div>
          <Flame className="w-8 h-8 text-neon-green animate-pulse" />
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1">DAILY WORKDAYS</span>
          <span className="text-2xl font-mono font-bold text-white">{profile?.workoutDays} Days</span>
          <span className="text-[8px] font-mono text-gray-400 block mt-1">Session Target: {profile?.sessionDuration} mins</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1">DIET CLASSIFICATION</span>
          <span className="text-sm font-mono font-bold text-cyber-blue truncate block mt-2 uppercase">{profile?.dietaryPreference.replace('_', ' ')}</span>
          <span className="text-[8px] font-mono text-gray-400 block mt-1">Targeting: recovery rate</span>
        </div>
      </div>

      {/* 3. Main Dashboard Body: Weekly Review & Daily preview splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Left Side: Weekly AI Review Panel (Cols 1 & 2) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />

          <div className="z-10 flex flex-col gap-6 w-full">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-green animate-pulse" />
                <span className="font-mono text-[9px] text-neon-green tracking-widest uppercase font-bold">
                  WEEKLY AI RECOVERY REVIEW
                </span>
              </div>
              <div className="flex gap-4 text-[9px] font-mono">
                <div>WORKOUT CONSISTENCY: <span className="text-white font-bold">{weeklyReview?.workoutConsistencyScore || 0}%</span></div>
                <div>NUTRITION COMPLIANCE: <span className="text-white font-bold">{weeklyReview?.nutritionConsistencyScore || 0}%</span></div>
              </div>
            </div>

            {/* AI Review Text details */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">WEEKLY SUMMARY</span>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  {weeklyReview?.review?.summary || 'No log data reported yet. Update your Daily Check-in to calibrate weekly review insights.'}
                </p>
              </div>

              {weeklyReview?.review?.improvements && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-[9px] font-mono text-neon-green uppercase block mb-2">AREAS SECURED</span>
                    <ul className="flex flex-col gap-2 font-mono text-[10px] text-gray-400">
                      {weeklyReview.review.improvements.map((imp, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-neon-green">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-cyber-blue uppercase block mb-2">ADJUSTMENTS INITIATED</span>
                    <ul className="flex flex-col gap-2 font-mono text-[10px] text-gray-400">
                      {weeklyReview.review.adjustments.map((adj, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-cyber-blue">•</span>
                          <span>{adj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Todays Split & Meals Previews */}
        <div className="flex flex-col gap-6 justify-between">
          
          {/* Today's Workout split preview */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between flex-1 relative">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                  TODAY WORKOUT SPLIT
                </span>
                <span className="text-[9px] font-mono text-cyber-blue font-bold">{todayLabel.toUpperCase()}</span>
              </div>
              <h4 className="text-lg font-bold text-white tracking-wide uppercase leading-tight">
                {todayWorkout?.focus || 'Active Recovery'}
              </h4>
              <p className="text-[10px] text-gray-400 font-light mt-1">
                {todayWorkout?.focus === 'Active Recovery' 
                  ? 'Perform light dynamic mobility exercises or slow walking.' 
                  : 'Perform training loading sequences matching your workout calendar.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
              <Link
                href="/dashboard/workouts"
                className="px-4 py-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue hover:text-black rounded font-mono text-[9px] tracking-widest uppercase transition-all duration-300"
              >
                Launch Tracker
              </Link>
            </div>
          </div>

          {/* Today's Meal budget preview */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between flex-1">
            <div>
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-4">
                DAILY MEAL PREVIEW
              </span>
              <div className="flex flex-col gap-2">
                {todayMeals.slice(0, 3).map((meal, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold text-white capitalize">{meal.type}</span>
                    <span className="text-[9px] text-gray-400 font-mono truncate max-w-[120px]">{meal.name}</span>
                    <span className="text-[9px] font-mono text-neon-green">{meal.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
              <Link
                href="/dashboard/nutrition"
                className="font-mono text-[9px] tracking-widest text-gray-400 hover:text-white uppercase transition-colors"
              >
                Inspect Meals →
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
