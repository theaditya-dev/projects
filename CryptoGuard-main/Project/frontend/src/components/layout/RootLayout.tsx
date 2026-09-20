import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AnimatedBlockchainBackground } from '../common/AnimatedBlockchainBackground';
import { apiClient } from '../../api/client';
import { Database, AlertTriangle } from 'lucide-react';

export const RootLayout: React.FC = () => {
  const isMock = apiClient.isMockMode();
  const location = useLocation();

  // Tune background intensity depending on page
  const getBackgroundIntensity = () => {
    if (location.pathname.startsWith('/graph')) return 'minimal';
    if (location.pathname.startsWith('/reports')) return 'subtle';
    if (location.pathname.startsWith('/investigate')) return 'subtle';
    return 'high';
  };

  return (
    <div className="min-h-screen flex flex-col relative text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* LAYER 1: Animated Blockchain Network Canvas */}
      <AnimatedBlockchainBackground intensity={getBackgroundIntensity()} />

      {/* LAYER 2: Readability & Vignette Ambient Filter */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-slate-950/40 backdrop-blur-[2px]" />

      {/* LAYER 3: Application UI Layout & Glass Surfaces */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Synthetic Mock Banner (when in mock mode) */}
        {isMock && (
          <div className="no-print w-full bg-indigo-950/80 border-b border-indigo-500/30 px-4 py-1.5 text-center text-xs font-mono text-indigo-300 flex items-center justify-center gap-2 shadow-sm backdrop-blur-md">
            <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              <strong>MOCK / DEMO RUNTIME:</strong> Operating on deterministic sample data conforming to Team 1 AI/ML schema. Team 2 REST integration pending.
            </span>
          </div>
        )}

        {/* Global Sticky Frosted Glass Navbar */}
        <Navbar />

        <div className="flex-1 flex overflow-hidden">
          {/* Frosted Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
