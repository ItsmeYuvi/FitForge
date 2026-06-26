'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Cpu, Send, TrendingUp, Sparkles, Scale, Activity, Ruler, BarChart2, ShieldCheck } from 'lucide-react';

interface Prediction {
  day: number;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  status: string;
}

interface PredictionData {
  confidenceScore: number;
  predictions: Prediction[];
  goalTimeline: string;
}

interface MeasurementLog {
  _id: string;
  weight: number;
  waist?: number;
  chest?: number;
  arms?: number;
  hips?: number;
  createdAt: string;
}

export default function ProgressDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<MeasurementLog[]>([]);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);

  // Log Form states
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');
  const [hips, setHips] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Active chart metric selection
  const [chartMetric, setChartMetric] = useState<'weight' | 'waist' | 'chest'>('weight');

  const fetchProgressData = async () => {
    if (!user) return;
    try {
      const clerkId = user.id;

      // 1. Fetch Measurement history
      const historyRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/progress/measurement/${clerkId}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setLogs(historyData);
        if (historyData.length > 0) {
          setWeight(historyData[0].weight.toString());
        }
      }

      // 2. Fetch predictions
      const predRes = await fetch(`https://fitforge-production-0c79.up.railway.app/api/progress/predictions/${clerkId}`);
      if (predRes.ok) {
        const predData = await predRes.json();
        setPredictions(predData);
      }

    } catch (err) {
      console.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const handleSubmitMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const res = await fetch('https://fitforge-production-0c79.up.railway.app/api/progress/measurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          weight: Number(weight),
          waist: waist ? Number(waist) : undefined,
          chest: chest ? Number(chest) : undefined,
          arms: arms ? Number(arms) : undefined,
          hips: hips ? Number(hips) : undefined
        })
      });

      if (res.ok) {
        setWaist('');
        setChest('');
        setArms('');
        setHips('');
        setShowForm(false);
        fetchProgressData(); // Reload statistics
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] font-mono text-xs text-cyber-blue gap-3">
        <Cpu className="w-5 h-5 animate-spin" />
        <span>STREAMING PROGRESS MATRIX LOGS...</span>
      </div>
    );
  }

  // Calculate coordinates for SVG graphs based on historical logs
  // We want to map points between (0-300) x (0-150)
  let polylinePoints = "";
  let chartPoints: { x: number; y: number }[] = [];
  if (logs.length > 1) {
    const reverseLogs = [...logs].reverse().slice(-7); // take last 7 logs
    const minVal = Math.min(...reverseLogs.map(l => (l[chartMetric] as number) || 0));
    const maxVal = Math.max(...reverseLogs.map(l => (l[chartMetric] as number) || 0));
    const valRange = maxVal - minVal || 1;

    chartPoints = reverseLogs.map((log, idx) => {
      const x = (idx / (reverseLogs.length - 1)) * 320 + 15;
      const val = (log[chartMetric] as number) || minVal;
      // Invert Y axis coordinates since SVG (0,0) is top-left
      const y = 120 - ((val - minVal) / valRange) * 80;
      return { x, y };
    });

    polylinePoints = chartPoints.map(p => `${p.x},${p.y}`).join(' ');
  }

  const confidenceScore = predictions?.confidenceScore || 85;

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-mono text-cyber-blue tracking-widest block uppercase">
            SECTION 04 // PROGRESS SIMULATOR
          </span>
          <h2 className="text-2xl font-display font-black text-white tracking-tight leading-none mt-1">
            Metrics Analytics & Predictions
          </h2>
        </div>

        <button
          onClick={() => setShowForm(true)}
          data-cursor-text="RECORD"
          className="px-4 py-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue hover:text-black rounded font-mono text-[9px] tracking-widest uppercase transition-all duration-300 pointer-events-auto"
        >
          Log Dimensions
        </button>
      </div>

      {/* Logger form overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-cyber-blue/30 relative">
            <form onSubmit={handleSubmitMeasurement} className="flex flex-col gap-5 font-mono text-xs text-gray-400">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">LOG BODY DIMENSIONS</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                  CLOSE [X]
                </button>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label>WEIGHT (KG) *</label>
                  <input
                    type="number" step="0.1" required value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label>WAIST (CM)</label>
                  <input
                    type="number" step="0.1" value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label>CHEST (CM)</label>
                  <input
                    type="number" step="0.1" value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label>ARMS (CM)</label>
                  <input
                    type="number" step="0.1" value={arms}
                    onChange={(e) => setArms(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label>HIPS (CM)</label>
                <input
                  type="number" step="0.1" value={hips}
                  onChange={(e) => setHips(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold uppercase text-[10px] tracking-widest rounded-lg flex justify-center items-center gap-2 mt-2"
              >
                {submitting ? 'TRANSMITTING...' : 'TRANSMIT LOGS'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Charts and Predictions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Progress Chart Panel (Cols 1 & 2) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />

          {/* Selector bar */}
          <div className="flex justify-between items-center z-10 flex-wrap gap-4">
            <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest block">
              BIOMETRIC SLOPE COMPARATOR
            </span>
            
            <div className="flex gap-1.5 bg-white/5 p-1 rounded-lg border border-white/5 font-mono text-[8px]">
              {['weight', 'waist', 'chest'].map(m => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m as any)}
                  className={`px-3 py-1.5 uppercase rounded tracking-wider transition-all duration-200 pointer-events-auto ${
                    chartMetric === m ? 'bg-cyber-blue text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Plot */}
          <div className="flex-1 flex items-center justify-center py-6 z-10">
            {logs.length > 1 ? (
              <div className="w-full h-44 relative">
                <svg className="w-full h-full" viewBox="0 0 350 150">
                  <line x1="0" y1="30" x2="350" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="75" x2="350" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="120" x2="350" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                  <polyline
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="2.5"
                    points={polylinePoints}
                    className="opacity-80"
                  />

                  {chartPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      fill="#00f0ff"
                      stroke="#030303"
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>
              </div>
            ) : (
              <div className="text-center font-mono text-[9px] text-gray-500 py-12">
                [SYSTEM WARNING] Insufficient data log points. Add multiple dimension logs to plot slopes.
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-4 font-mono text-[8px] text-gray-500 z-10 uppercase">
            <span>PAST TIMELINES</span>
            <span>CHART RANGE: LAST 7 ENTRIES</span>
            <span>LIVE DATA OK</span>
          </div>
        </div>

        {/* Prediction Confidence Circular Widget (1 col) */}
        {predictions && (
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between items-center text-center relative overflow-hidden">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-4 self-start">
              PREDICTOR CONFIDENCE
            </span>

            {/* Glowing SVG radial ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="#39ff14"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - confidenceScore / 100)}
                  className="opacity-90 transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-mono font-black text-white">{confidenceScore}%</span>
                <span className="text-[7px] font-mono text-gray-400 tracking-wider">STREAK RATE</span>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-lg border border-white/5 mt-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neon-green shrink-0 animate-pulse" />
              <p className="text-[9px] font-mono text-gray-400 leading-tight text-left">
                Confidence coefficient calculated dynamically based on your workout logging consistency.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 3. AI Transformation predictions tabs */}
      {predictions && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-[0.02]" />
          
          <div className="z-10 flex gap-4 items-center border-b border-white/5 pb-4">
            <Sparkles className="w-5 h-5 text-neon-green shrink-0 animate-pulse" />
            <div>
              <span className="text-[9px] font-mono text-neon-green tracking-widest block uppercase font-bold">
                NEURAL TRANSFORMATION PREDICTOR MODEL
              </span>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                {predictions.goalTimeline}
              </p>
            </div>
          </div>

          <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {predictions.predictions.map((p, idx) => (
              <div key={p.day} className="bg-black/40 p-5 rounded-xl border border-white/5 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-cyber-blue block mb-1">
                    DAY {p.day} PROJECTION
                  </span>
                  
                  <div className="flex flex-col gap-2 mt-3 font-mono text-[10px] text-gray-400">
                    <div className="flex justify-between">
                      <span>WEIGHT</span>
                      <span className="text-white font-bold">{p.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BODY FAT</span>
                      <span className="text-white font-bold">{p.bodyFat}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LEAN MUSCLE</span>
                      <span className="text-white font-bold">{p.muscleMass} kg</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-2.5 rounded border border-white/5 font-mono text-[8px] text-gray-400 flex gap-2 items-center">
                  <Activity className="w-3.5 h-3.5 text-neon-green animate-pulse" />
                  <span>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Table logs history */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-4">
          HISTORICAL BIO-LOG TABLE
        </span>

        {logs.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left font-mono text-[10px] text-gray-400">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 uppercase">
                  <th className="pb-3">DATE</th>
                  <th className="pb-3 text-right">WEIGHT</th>
                  <th className="pb-3 text-right">WAIST</th>
                  <th className="pb-3 text-right">CHEST</th>
                  <th className="pb-3 text-right">ARMS</th>
                  <th className="pb-3 text-right">HIPS</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3">{new Date(log.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right text-white font-bold">{log.weight} kg</td>
                    <td className="py-3 text-right">{log.waist ? `${log.waist} cm` : '--'}</td>
                    <td className="py-3 text-right">{log.chest ? `${log.chest} cm` : '--'}</td>
                    <td className="py-3 text-right">{log.arms ? `${log.arms} cm` : '--'}</td>
                    <td className="py-3 text-right">{log.hips ? `${log.hips} cm` : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <span className="text-[10px] text-gray-500 font-mono">No measurements recorded. Click &quot;Log Dimensions&quot; above to log statistics.</span>
        )}
      </div>

    </div>
  );
}
