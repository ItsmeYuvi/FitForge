'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Cpu, Play, CheckSquare, Plus, Trash2, Calendar, Dumbbell, ShieldAlert, Sparkles, Clock, CircleAlert } from 'lucide-react';

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

interface WorkoutPlan {
  _id: string;
  workoutSplit: string;
  progressiveOverloadStrategy: string;
  warmupAdvice: string;
  cooldownAdvice: string;
  workoutPlan: WorkoutDay[];
}

interface LoggedSet {
  setIndex: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

interface LoggedExercise {
  name: string;
  sets: LoggedSet[];
}

interface WorkoutHistory {
  _id: string;
  dayName: string;
  focus: string;
  duration: number; // in seconds
  createdAt: string;
}

export default function WorkoutsDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [generating, setGenerating] = useState(false);

  // Live Workout Tracker states
  const [isTracking, setIsTracking] = useState(false);
  const [trackedDay, setTrackedDay] = useState<WorkoutDay | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [trackedExercises, setTrackedExercises] = useState<LoggedExercise[]>([]);
  
  // Rest Timer states
  const [restCount, setRestCount] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWorkoutData = async () => {
    if (!user) return;
    try {
      const clerkId = user.id;

      // 1. Fetch Active Plan
      const planRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/workout/${clerkId}`);
      if (planRes.ok) {
        const planData = await planRes.json();
        setPlan(planData);
      }

      // 2. Fetch Sessions History
      const historyRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/workout/sessions/${clerkId}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }

    } catch (err) {
      console.error('Error fetching workouts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWorkoutData();
    }
  }, [user]);

  // Handle AI Regeneration
  const handleRegenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await fetch('https://fitforge-production-0c79.up.railway.app/api/workout/generate', {
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

  // Start Live Session
  const startWorkoutSession = (day: WorkoutDay) => {
    setTrackedDay(day);
    setElapsedSeconds(0);
    setIsTracking(true);

    // Map exercises to tracking model
    const initialLogged: LoggedExercise[] = day.exercises.map(ex => {
      const setsArray: LoggedSet[] = [];
      for (let i = 0; i < ex.sets; i++) {
        setsArray.push({ setIndex: i + 1, weight: 0, reps: 0, isCompleted: false });
      }
      return { name: ex.name, sets: setsArray };
    });

    setTrackedExercises(initialLogged);

    // Start Stopwatch timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  // Check complete a set, trigger rest timer
  const handleSetCompletion = (exIdx: number, setIdx: number, val: boolean) => {
    const updated = [...trackedExercises];
    updated[exIdx].sets[setIdx].isCompleted = val;
    setTrackedExercises(updated);

    if (val) {
      // Trigger 90s rest countdown timer
      startRestCountdown(90);
    }
  };

  const updateSetWeight = (exIdx: number, setIdx: number, w: number) => {
    const updated = [...trackedExercises];
    updated[exIdx].sets[setIdx].weight = w;
    setTrackedExercises(updated);
  };

  const updateSetReps = (exIdx: number, setIdx: number, r: number) => {
    const updated = [...trackedExercises];
    updated[exIdx].sets[setIdx].reps = r;
    setTrackedExercises(updated);
  };

  // Rest timer
  const startRestCountdown = (sec: number) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestCount(sec);
    setShowRestTimer(true);

    restTimerRef.current = setInterval(() => {
      setRestCount(prev => {
        if (prev <= 1) {
          clearInterval(restTimerRef.current!);
          setShowRestTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Finish session and log to backend
  const finishWorkoutSession = async () => {
    if (!user || !trackedDay) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setShowRestTimer(false);

    try {
      const res = await fetch('https://fitforge-production-0c79.up.railway.app/api/workout/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          workoutPlanId: plan?._id,
          dayName: trackedDay.day,
          focus: trackedDay.focus,
          duration: elapsedSeconds,
          loggedExercises: trackedExercises
        })
      });

      if (res.ok) {
        setIsTracking(false);
        setTrackedDay(null);
        fetchWorkoutData(); // Reload history
      }
    } catch (err) {
      console.error('Error logging session:', err);
    }
  };

  // Format stopwatch output: MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] font-mono text-xs text-cyber-blue gap-3">
        <Cpu className="w-5 h-5 animate-spin" />
        <span>STREAMING COMPILATION PLANS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Header Area */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-mono text-cyber-blue tracking-widest block uppercase">
            SECTION 02 // WORKOUTS ENGINE
          </span>
          <h2 className="text-2xl font-display font-black text-white tracking-tight leading-none mt-1">
            Training Splits & Overload Strategies
          </h2>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={generating}
          data-cursor-text="REGEN"
          className="px-4 py-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue hover:text-black rounded font-mono text-[9px] tracking-widest uppercase transition-all duration-300 pointer-events-auto"
        >
          {generating ? 'Compiling AI Split...' : 'Regenerate Plan'}
        </button>
      </div>

      {/* 2. Live Tracker Overlay */}
      {isTracking && trackedDay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-2xl border border-neon-green/30 my-8 flex flex-col gap-6 relative">
            
            {/* Top row status */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <span className="text-[8px] font-mono text-neon-green tracking-widest uppercase block animate-pulse">
                  ACTIVE TRACKER ENGAGED
                </span>
                <h3 className="text-sm font-bold text-white uppercase mt-0.5">
                  {trackedDay.day} // {trackedDay.focus}
                </h3>
              </div>

              {/* Glowing Timer */}
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5 font-mono text-xs font-bold text-cyber-blue shadow-inner">
                <Clock className="w-4 h-4 text-cyber-blue" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            </div>

            {/* Rest Timer Banner */}
            {showRestTimer && (
              <div className="bg-neon-green/10 border border-neon-green/30 p-3 rounded-lg flex items-center justify-between font-mono text-xs text-neon-green animate-pulse">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-neon-green animate-spin" />
                  <span>REST INTERVAL SEQUENCE RUNNING</span>
                </div>
                <span className="font-bold">{restCount}s LEFT</span>
              </div>
            )}

            {/* Exercises Logging List */}
            <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2">
              {trackedDay.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">{ex.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono block">Target: {ex.sets} sets x {ex.reps} (Rest: {ex.rest})</span>
                  </div>

                  {/* Sets table */}
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-2">
                    {trackedExercises[exIdx]?.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-4 font-mono text-[10px]">
                        <span className="text-gray-500 w-8">SET {set.setIndex}</span>
                        
                        <div className="flex items-center gap-1.5 flex-1">
                          <input 
                            type="number" placeholder="KG"
                            onChange={(e) => updateSetWeight(exIdx, setIdx, Number(e.target.value))}
                            className="w-16 bg-white/5 border border-white/10 rounded p-1.5 text-white text-center"
                          />
                          <span className="text-gray-600">KG</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-1">
                          <input 
                            type="number" placeholder="REPS"
                            onChange={(e) => updateSetReps(exIdx, setIdx, Number(e.target.value))}
                            className="w-16 bg-white/5 border border-white/10 rounded p-1.5 text-white text-center"
                          />
                          <span className="text-gray-600">REPS</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSetCompletion(exIdx, setIdx, !set.isCompleted)}
                          className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${
                            set.isCompleted 
                              ? 'bg-neon-green border-neon-green text-black' 
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          {set.isCompleted && '✓'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Finish session button */}
            <button
              onClick={finishWorkoutSession}
              className="w-full py-4 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold font-mono text-[10px] tracking-widest uppercase rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Complete Workout Session
            </button>
          </div>
        </div>
      )}

      {/* 3. Workout Splits and Details */}
      {plan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Calendar splits sidebar (1 col) */}
          <div className="flex flex-col gap-3">
            {plan.workoutPlan.map((d, idx) => (
              <button
                key={d.day}
                onClick={() => setActiveTab(idx)}
                className={`p-4 text-left font-mono text-[10px] rounded-xl border transition-all duration-200 pointer-events-auto flex items-center justify-between ${
                  activeTab === idx 
                    ? 'bg-cyber-blue/10 border-cyber-blue/40 text-white font-bold' 
                    : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                }`}
              >
                <div>
                  <span className="text-neon-green block mb-1">{d.day.toUpperCase()}</span>
                  <span className="truncate block max-w-[150px]">{d.focus}</span>
                </div>
                <Play className="w-3.5 h-3.5 text-cyber-blue shrink-0" />
              </button>
            ))}
          </div>

          {/* Current day exercises display (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Exercises display */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between flex-1 relative">
              <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />

              <div className="z-10">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-6">
                  <div>
                    <span className="text-[9px] font-mono text-neon-green tracking-widest uppercase block">
                      TARGET TRAINING SPLIT FOR TODAY
                    </span>
                    <h3 className="text-lg font-bold text-white uppercase mt-1">
                      {plan.workoutPlan[activeTab].day} // {plan.workoutPlan[activeTab].focus}
                    </h3>
                  </div>
                  
                  {plan.workoutPlan[activeTab].focus !== 'Active Recovery & Stretching' && (
                    <button
                      onClick={() => startWorkoutSession(plan.workoutPlan[activeTab])}
                      data-cursor-text="START"
                      className="px-4 py-2 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-mono font-semibold text-[9px] tracking-widest uppercase rounded hover:scale-[1.02] active:scale-[0.98] transition-all pointer-events-auto"
                    >
                      Start Workout
                    </button>
                  )}
                </div>

                {/* Exercises lists */}
                <div className="flex flex-col gap-3">
                  {plan.workoutPlan[activeTab].exercises.map((ex, idx) => (
                    <div key={idx} className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <span className="text-xs font-bold text-white block">{ex.name}</span>
                        {ex.notes && <span className="text-[9px] text-gray-500 font-mono block mt-0.5">Note: {ex.notes}</span>}
                      </div>
                      
                      <div className="flex gap-4 font-mono text-[9px] text-gray-400">
                        <div>SETS: <span className="text-white font-bold">{ex.sets}</span></div>
                        <div>REPS: <span className="text-white font-bold">{ex.reps}</span></div>
                        <div>REST: <span className="text-white font-bold">{ex.rest}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warmup & Cooldown tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5 z-10">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-cyber-blue uppercase block mb-1">WARM-UP ENCODING</span>
                  <p className="text-[10px] text-gray-400 font-light leading-relaxed">{plan.warmupAdvice}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-neon-green uppercase block mb-1">COOLDOWN DISCHARGE</span>
                  <p className="text-[10px] text-gray-400 font-light leading-relaxed">{plan.cooldownAdvice}</p>
                </div>
              </div>
            </div>

            {/* Progressive overload instructions panel */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex gap-4 items-start relative overflow-hidden">
              <Sparkles className="w-5 h-5 text-neon-green mt-0.5 shrink-0 animate-pulse" />
              <div>
                <span className="text-[9px] font-mono text-neon-green tracking-widest block mb-1 uppercase font-bold">
                  PROGRESSIVE OVERLOAD CYCLIC STRATEGY
                </span>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  {plan.progressiveOverloadStrategy}
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 text-center flex flex-col items-center gap-4">
          <CircleAlert className="w-8 h-8 text-gray-500 animate-pulse" />
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">No active workout plan loaded.</h3>
          <button 
            onClick={handleRegenerate}
            className="px-6 py-3 bg-cyber-blue text-black font-mono text-[10px] font-bold tracking-widest uppercase rounded-lg hover:scale-102 transition-all"
          >
            Generate AI Plan
          </button>
        </div>
      )}

      {/* 4. Workout History Log list */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-4">
          HISTORICAL LOG ENTRIES
        </span>
        
        {history.length > 0 ? (
          <div className="flex flex-col gap-3 font-mono text-[10px]">
            {history.slice(0, 5).map((log) => (
              <div key={log._id} className="bg-black/30 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Dumbbell className="w-4 h-4 text-cyber-blue" />
                  <div>
                    <span className="text-white font-bold block">{log.dayName} - {log.focus}</span>
                    <span className="text-gray-500 text-[8px]">{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <span className="text-neon-green font-bold">
                  {Math.round(log.duration / 60)} MINS ELAPSED
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-gray-500 font-mono">No logged training sessions found. Complete your first workout split above.</span>
        )}
      </div>

    </div>
  );
}
