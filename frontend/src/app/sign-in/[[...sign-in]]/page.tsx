'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SignIn } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Sparkles, Utensils, Activity, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Dynamically load R3F AthleteScene to avoid server-side rendering issues
const AthleteScene = dynamic(
  () => import('@/components/canvas/AthleteScene'),
  { ssr: false }
);

const rotatingMessages = [
  "Welcome Back",
  "Synchronizing Fitness Matrix",
  "Accessing Physical Twin",
  "Engineering Metamorphosis"
];

export default function SignInPage() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % rotatingMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-dark-bg text-foreground flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* 1. Left Side: Futuristic Fitness Visualization */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative bg-dark-surface border-r border-white/5 items-center justify-center p-12 overflow-hidden">
        
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 cyber-grid opacity-[0.015] pointer-events-none z-0" />
        
        {/* R3F Athlete Canvas Container */}
        <div className="absolute inset-0 w-full h-full z-0 opacity-80 pointer-events-none">
          <AthleteScene scrollProgress={0.4} activeMetric="pelvis" />
        </div>

        {/* Diagonal glowing flare in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-blue opacity-5 blur-[150px] pointer-events-none" />

        {/* Floating Achievements Preview Card */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[18%] left-[8%] glass-panel p-4 rounded-xl border border-cyber-blue/20 w-64 shadow-2xl z-10"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-mono text-cyber-blue tracking-widest uppercase">// SYSTEM MILESTONE ACHIEVEMENT</span>
            <Sparkles className="w-3.5 h-3.5 text-cyber-blue animate-pulse" />
          </div>
          <span className="text-sm font-display font-black text-white block">Neuromuscular Peak</span>
          <span className="text-[10px] text-gray-400 font-mono block mt-1.5">Goal Completed: 12 Consecutive Lifts</span>
          <span className="text-[10px] text-neon-green font-mono block mt-0.5">✓ +1500 XP Earned</span>
        </motion.div>

        {/* Floating Stats Card */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[8%] glass-panel p-4 rounded-xl border border-neon-green/20 w-60 shadow-2xl z-10"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-mono text-neon-green tracking-widest uppercase">// METABOLIC COMPOSITION LOG</span>
            <Activity className="w-3.5 h-3.5 text-neon-green animate-pulse" />
          </div>
          <span className="text-sm font-display font-black text-white block">Active Calibration</span>
          <div className="flex justify-between text-[9px] font-mono text-gray-400 mt-2 border-t border-white/5 pt-1.5">
            <span>Weight: -3.5kg</span>
            <span>Bodyfat: -2.4%</span>
          </div>
        </motion.div>

        {/* Floating AI Insight Card */}
        <motion.div
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[48%] right-[12%] glass-panel p-4 rounded-xl border border-white/10 w-64 shadow-2xl z-10"
        >
          <div className="flex gap-3 items-start">
            <Activity className="w-4 h-4 text-neon-green shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="text-[8px] font-mono text-neon-green tracking-widest block uppercase">WEEKLY PERFORMANCE LOG</span>
              <p className="text-[10px] text-gray-300 font-light leading-relaxed mt-1">
                98% workout consistency rate detected. Sleep efficiency matches metabolic recovery threshold. Excellent progress.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main rotating title section in bottom-left */}
        <div className="absolute bottom-16 left-16 z-25 max-w-md flex flex-col gap-3">
          <span className="text-[9px] font-mono tracking-[0.2em] text-cyber-blue uppercase block">
            // FITFORGE CYBERNETIC OS //
          </span>
          <div className="h-20 flex items-center">
            <AnimatePresence mode="wait">
              <motion.h2
                key={msgIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-display font-black text-white uppercase tracking-tight leading-[1.1]"
              >
                {rotatingMessages[msgIdx]}
              </motion.h2>
            </AnimatePresence>
          </div>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Resume yourMetamorphosis. Load your customized progression split, log dynamic workout coefficients, and monitor your physical twin metrics in real time.
          </p>
        </div>
      </div>

      {/* 2. Right Side: Premium custom credentials box */}
      <div className="w-full lg:w-1/2 h-full min-h-screen overflow-y-auto flex flex-col justify-between py-12 px-6 sm:px-12 md:px-20 z-10">
        
        {/* Header navigation bar */}
        <header className="flex justify-between items-center w-full max-w-md mx-auto mb-8 lg:mb-0">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-cyber-blue animate-pulse" />
            <span className="font-display font-black text-sm tracking-widest text-white">
              FITFORGE <span className="text-neon-green">AI</span>
            </span>
          </Link>
          <span className="font-mono text-[9px] tracking-widest text-gray-500 uppercase">
            // SECURE LINK
          </span>
        </header>

        {/* Clerk SignIn Wrap Card */}
        <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-6">
          <div className="w-full glass-panel p-8 sm:p-10 rounded-2xl border border-white/10 shadow-2xl relative">
            
            {/* Ambient scanner light line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-50" />
            
            <div className="text-center mb-6">
              <h1 className="text-xl font-display font-black text-white uppercase tracking-wider">
                Access System Core
              </h1>
              <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-wide">
                Link active pilot credentials to proceed
              </p>
            </div>

            {/* Custom Styled Clerk SignIn Component */}
            <SignIn
              forceRedirectUrl="/dashboard"
              signUpUrl="/sign-up"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent border-0 shadow-none p-0 w-full",
                  header: "hidden", // Hide clerk default headers
                  footer: "hidden", // Hide clerk default footers
                  socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyber-blue/30 text-white font-mono text-[9px] tracking-widest uppercase p-3 rounded-lg transition-all duration-300 w-full mb-3 flex items-center justify-center gap-2",
                  socialButtonsBlockButtonText: "text-white font-mono text-[9px] font-bold tracking-widest uppercase",
                  dividerRow: "my-4 flex items-center justify-center gap-3 w-full",
                  dividerLine: "h-[1px] bg-white/10 flex-1",
                  dividerText: "text-gray-500 font-mono text-[8px] uppercase tracking-wider px-2",
                  formFieldLabel: "text-gray-400 font-mono text-[8px] uppercase tracking-widest mb-1.5 block font-bold",
                  formFieldInput: "bg-white/5 border border-white/10 rounded-lg p-3 text-white text-xs w-full focus:border-cyber-blue focus:outline-none transition-all duration-300 font-mono",
                  formButtonPrimary: "w-full py-4 mt-2 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-mono font-black text-[10px] tracking-widest uppercase rounded-lg hover:shadow-lg hover:shadow-cyber-blue/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border-0 cursor-none",
                  formFieldInputShowPasswordButton: "text-gray-400 hover:text-white right-3",
                  formFieldInputShowPasswordIcon: "w-4 h-4",
                  alert: "bg-red-950/20 border border-red-800 text-red-400 p-3 rounded-lg font-mono text-[9px] uppercase mb-4",
                  identityPreview: "bg-white/5 border border-white/10 p-3 rounded-lg text-white font-mono text-xs w-full"
                },
                layout: {
                  socialButtonsVariant: "blockButton"
                }
              } as any}
            />

            {/* Custom footer actions overlay */}
            <div className="mt-6 border-t border-white/5 pt-6 text-center">
              <span className="text-gray-400 font-mono text-[10px]">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-cyber-blue hover:underline hover:text-white transition-colors duration-200 ml-1">
                  Sign Up
                </Link>
              </span>
            </div>

          </div>

          {/* Conversion Optimization Section / Social Proof */}
          <div className="w-full mt-6 text-center flex flex-col gap-2.5">
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.15em] block">
              // THOUSANDS OF AI-GENERATED WORKOUTS ACTIVE //
            </span>
            <div className="flex justify-center gap-6 text-[9px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyber-blue shrink-0" />
                Secure Session
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyber-blue shrink-0" />
                Persistent Profile
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyber-blue shrink-0" />
                Auto-Reconnect
              </span>
            </div>
          </div>

        </div>

        {/* Footer legal notes */}
        <footer className="text-center font-mono text-[8px] text-gray-600 tracking-wider w-full mt-8 lg:mt-0">
          SECURE PROTOCOL BY FITFORGE CORP © 2026. ALL RIGHTS REGISTERED.
        </footer>

      </div>

    </div>
  );
}
