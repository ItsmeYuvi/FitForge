'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Cpu, Download, FileText, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

interface DossierData {
  profile: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    goal: string;
    experienceLevel: string;
    availableEquipment: string[];
    workoutDays: number;
    sessionDuration: number;
    dietaryPreference: string;
    activityLevel: string;
    injuries: string;
  };
  workout: {
    workoutSplit: string;
    progressiveOverloadStrategy: string;
    warmupAdvice: string;
    cooldownAdvice: string;
    workoutPlan: {
      day: string;
      focus: string;
      exercises: { name: string; sets: number; reps: string; rest: string; notes?: string }[];
    }[];
  } | null;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    meals: { type: string; name: string; description: string; macros: string }[];
  } | null;
  progress: {
    measurements: { weight: number; waist?: number; chest?: number; arms?: number; hips?: number; createdAt: string }[];
    sessionsCount: number;
  };
  exportedAt: string;
}

export default function ExportDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<DossierData | null>(null);

  useEffect(() => {
    const fetchDossier = async () => {
      if (!user) return;
      try {
        const res = await fetch(`https://fitforge-production-0c79.up.railway.app/api/export/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setDossier(data);
        }
      } catch (err) {
        console.error('Error fetching dossier:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] font-mono text-xs text-cyber-blue gap-3">
        <Cpu className="w-5 h-5 animate-spin" />
        <span>COMPILING COMPLETE PHYSIC DOSSIER...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Page Header (Hidden on print) */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4 print:hidden shrink-0">
        <div>
          <span className="text-[9px] font-mono text-cyber-blue tracking-widest block uppercase">
            SECTION 06 // REPORT EXPORTER
          </span>
          <h2 className="text-2xl font-display font-black text-white tracking-tight leading-none mt-1">
            Export Bio-Report Dossier
          </h2>
        </div>

        {dossier && (
          <button
            onClick={handlePrint}
            data-cursor-text="PRINT"
            className="px-5 py-3 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-mono font-semibold text-[10px] tracking-widest uppercase rounded-lg hover:scale-[1.03] active:scale-[0.98] transition-all pointer-events-auto flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        )}
      </div>

      {/* 2. Overview Card (Hidden on print) */}
      {dossier && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden print:hidden">
          <div className="absolute inset-0 cyber-grid opacity-[0.02]" />
          
          <div className="z-10 flex gap-4 items-start">
            <FileText className="w-6 h-6 text-cyber-blue shrink-0 animate-bounce" />
            <div>
              <span className="text-[9px] font-mono text-cyber-blue tracking-widest block uppercase font-bold">
                PLATFORM DATA EXPORT CODES
              </span>
              <h3 className="text-sm font-bold text-white uppercase mt-1">
                Your Complete Fitness Dossier is Ready
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed mt-2 max-w-xl">
                This compiles your biometrics, AI-generated training protocols, calories/macros allocations, and logs into a single styled report. Save this document directly as a PDF via your browser print dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRINT DOSSIER TARGET CONTAINER (Visible during print, styled dark/light dynamically) */}
      {dossier && (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col gap-8 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          
          {/* Document Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4 print:border-black/10">
            <div>
              <span className="text-[8px] font-mono text-neon-green uppercase tracking-widest block print:text-black/60">
                FITFORGE SYSTEMS REPORT DOSSIER
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white mt-1 print:text-black">
                {user?.fullName || 'Athletic Pilot'}
              </h1>
            </div>
            <div className="text-right font-mono text-[8px] text-gray-500 print:text-black/60">
              <div>EXPORTED: {new Date(dossier.exportedAt).toLocaleDateString()}</div>
              <div>CLASSIFICATION: SECURE PROFILE</div>
            </div>
          </div>

          {/* Section A: Biometric metrics */}
          <div>
            <h3 className="text-xs font-mono font-bold text-cyber-blue uppercase mb-3 print:text-black border-b border-white/5 pb-1 print:border-black/5">
              01 // Biometric Metrics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[10px] text-gray-400 print:text-black">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 print:bg-black/5 print:border-black/5">
                <span>HEIGHT:</span>
                <span className="text-white font-bold block mt-1 print:text-black">{dossier.profile.height} cm</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 print:bg-black/5 print:border-black/5">
                <span>WEIGHT:</span>
                <span className="text-white font-bold block mt-1 print:text-black">{dossier.profile.weight} kg</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 print:bg-black/5 print:border-black/5">
                <span>GOAL:</span>
                <span className="text-white font-bold block mt-1 print:text-black uppercase">{dossier.profile.goal.replace('_', ' ')}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 print:bg-black/5 print:border-black/5">
                <span>DIET:</span>
                <span className="text-white font-bold block mt-1 print:text-black uppercase">{dossier.profile.dietaryPreference.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Section B: Workout Plan */}
          {dossier.workout && (
            <div>
              <h3 className="text-xs font-mono font-bold text-cyber-blue uppercase mb-3 print:text-black border-b border-white/5 pb-1 print:border-black/5">
                02 // Weekly Workout Split
              </h3>
              <p className="text-[10px] text-gray-400 font-mono mb-4 print:text-black leading-relaxed">
                OVERLOAD SYSTEM: {dossier.workout.progressiveOverloadStrategy}
              </p>

              <div className="flex flex-col gap-4">
                {dossier.workout.workoutPlan.slice(0, 4).map((d, idx) => (
                  <div key={idx} className="bg-black/30 p-4 rounded-xl border border-white/5 print:bg-black/5 print:border-black/5 font-mono text-[9px] text-gray-400 print:text-black">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2 print:border-black/5">
                      <span className="font-bold text-white print:text-black uppercase">{d.day} // {d.focus}</span>
                    </div>

                    <div className="flex flex-col gap-1 text-[8px]">
                      {d.exercises.map((ex, eIdx) => (
                        <div key={eIdx} className="flex justify-between">
                          <span>{ex.name}</span>
                          <span>{ex.sets} sets x {ex.reps} (Rest: {ex.rest})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section C: Nutrition Plan */}
          {dossier.nutrition && (
            <div className="page-break-before">
              <h3 className="text-xs font-mono font-bold text-cyber-blue uppercase mb-3 print:text-black border-b border-white/5 pb-1 print:border-black/5">
                03 // Nutrition Meal targets
              </h3>
              <div className="grid grid-cols-4 gap-4 font-mono text-[9px] text-gray-400 print:text-black mb-4">
                <div>CALORIES: <span className="text-white font-bold print:text-black">{dossier.nutrition.calories} kcal</span></div>
                <div>PROTEIN: <span className="text-white font-bold print:text-black">{dossier.nutrition.protein}g</span></div>
                <div>CARBS: <span className="text-white font-bold print:text-black">{dossier.nutrition.carbs}g</span></div>
                <div>FATS: <span className="text-white font-bold print:text-black">{dossier.nutrition.fats}g</span></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dossier.nutrition.meals.map((meal, idx) => (
                  <div key={idx} className="bg-black/30 p-3 rounded-lg border border-white/5 print:bg-black/5 print:border-black/5 font-mono text-[8px] text-gray-400 print:text-black">
                    <div className="flex justify-between border-b border-white/5 pb-1 mb-1 print:border-black/5">
                      <span className="font-bold text-white print:text-black uppercase">{meal.type} // {meal.name}</span>
                      <span className="text-neon-green font-bold print:text-black">{meal.macros}</span>
                    </div>
                    <p className="text-gray-500 print:text-black/70 leading-normal">{meal.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. PDF Print style wrapper (Inject stylesheet only for printing) */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          header, aside, footer, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .page-break-before {
            page-break-before: always;
          }
        }
      `}</style>

    </div>
  );
}
