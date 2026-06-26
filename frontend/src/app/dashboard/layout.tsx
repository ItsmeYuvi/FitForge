'use client';

import React, { useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, LayoutDashboard, Calendar, Utensils, TrendingUp, MessageSquare, Download, LogOut, Home, Cpu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to sign-in page if not logged in, and check onboarding status
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/');
      } else {
        const checkOnboarding = async () => {
          try {
            const res = await fetch(`https://fitforge-production-0c79.up.railway.app/api/onboarding/${user.id}`);
            if (res.status === 404) {
              router.push('/onboarding');
            }
          } catch (err) {
            console.error('Failed to verify onboarding status:', err);
          }
        };
        checkOnboarding();
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center font-mono text-xs text-cyber-blue gap-3">
        <Cpu className="w-6 h-6 animate-spin" />
        <span>CALIBRATING SYSTEMS PROFILE...</span>
      </div>
    );
  }

  const sidebarLinks = [
    { name: 'OVERVIEW', path: '/dashboard', icon: LayoutDashboard },
    { name: 'WORKOUT LOGS', path: '/dashboard/workouts', icon: Calendar },
    { name: 'NUTRITION ENGINE', path: '/dashboard/nutrition', icon: Utensils },
    { name: 'PROGRESS SLOPE', path: '/dashboard/progress', icon: TrendingUp },
    { name: 'AI FITNESS COACH', path: '/dashboard/coach', icon: MessageSquare },
    { name: 'REPORT DOSSIER', path: '/dashboard/export', icon: Download },
  ];

  return (
    <div className="min-h-screen w-full bg-dark-bg text-foreground flex flex-col md:flex-row relative">
      
      {/* 1. Left Sidebar Panel */}
      <aside className="w-full md:w-64 bg-dark-surface border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between shrink-0 z-30">
        
        {/* Top: Logo branding */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Dumbbell className="w-5 h-5 text-cyber-blue animate-pulse" />
          <span className="font-display font-black text-sm tracking-widest text-white">
            FITFORGE <span className="text-neon-green">OS</span>
          </span>
        </div>

        {/* Middle: Sidebar Links */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 font-mono text-[9px] tracking-widest">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.path;
            
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                  isActive 
                    ? 'bg-neon-green/10 border-neon-green/30 text-white font-bold' 
                    : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-neon-green' : 'text-gray-500'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Clerk Profile User Card */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate max-w-[120px]">
                {user?.firstName || 'Athletic Pilot'}
              </span>
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">
                CORE SYSTEM USER
              </span>
            </div>
          </div>
          
          <Link href="/" className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <Home className="w-3.5 h-3.5" />
          </Link>
        </div>

      </aside>

      {/* 2. Main content area */}
      <main className="flex-1 h-screen overflow-y-auto z-10 p-6 sm:p-10 relative">
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 cyber-grid opacity-[0.008] pointer-events-none z-0" />
        
        <div className="relative z-10 w-full max-w-6xl mx-auto pb-12">
          {children}
        </div>
      </main>

    </div>
  );
}
