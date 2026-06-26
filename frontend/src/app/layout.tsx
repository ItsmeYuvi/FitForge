import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import InteractiveCursor from '@/components/ui/InteractiveCursor';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FitForge AI - Futuristic Fitness Operating System',
  description: 'Predict your future physical form. FitForge AI leverages deep neural scanning to simulate, analyze, and build custom training blueprints.',
  keywords: ['AI Fitness', 'Digital Twin', 'Fitness OS', 'Workout Planner', 'Body Scan', 'FitForge'],
  authors: [{ name: 'DeepMind Dev' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html
        lang="en"
        className={`${inter.variable} ${outfit.variable} h-full scroll-smooth select-none`}
      >
        <body className="font-sans antialiased text-foreground bg-dark-bg min-h-full">
          <InteractiveCursor />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
