import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  Database, 
  Radio, 
  HardDrive
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { GlassBadge } from '../common/GlassBadge';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const isMock = apiClient.isMockMode();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    if (q.startsWith('bc1') || q.startsWith('1') || q.startsWith('3') || q.length > 25 && !q.includes('.')) {
      if (q.length === 64) {
        navigate(`/investigate/tx/${encodeURIComponent(q)}`);
      } else {
        navigate(`/investigate/wallet/${encodeURIComponent(q)}`);
      }
    } else if (q.includes('.')) {
      navigate(`/investigate/ip/${encodeURIComponent(q)}`);
    } else {
      navigate(`/alerts?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-6 py-3 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:shadow-glow-cyan transition-all duration-300">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-wider text-white">
                  Crypto<span className="text-cyan-400">Guard</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                  FORENSICS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Bitcoin Transaction &amp; Network Correlation Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Global Omnibar Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TXID, Bitcoin Address, Peer IP, or Cluster ID..."
              className="glass-input w-full pl-10 pr-20 py-1.5 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:border-cyan-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[10px] font-mono text-slate-300 transition-colors"
            >
              QUERY ↵
            </button>
          </form>
        </div>

        {/* Right Status Badges & Analyst Station */}
        <div className="flex items-center gap-3">
          {/* Mode Indicator */}
          {isMock ? (
            <GlassBadge variant="purple" size="xs" className="hidden sm:inline-flex gap-1.5">
              <Database className="w-3 h-3 text-purple-400" />
              MOCK / DEMO RUNTIME
            </GlassBadge>
          ) : (
            <GlassBadge variant="cyan" size="xs" className="hidden sm:inline-flex gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              TEAM 2 REST API CONNECTED
            </GlassBadge>
          )}

          {/* System Mode */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/10 text-[11px] font-mono text-emerald-400">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>OFFLINE NODE</span>
          </div>

          {/* Analyst Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-md bg-slate-800 border border-white/15 flex items-center justify-center text-cyan-400 text-xs font-mono font-bold">
              402
            </div>
            <div className="text-left hidden xl:block">
              <div className="text-xs font-medium text-slate-200">Analyst #402</div>
              <div className="text-[10px] font-mono text-slate-400">FORENSICS</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
