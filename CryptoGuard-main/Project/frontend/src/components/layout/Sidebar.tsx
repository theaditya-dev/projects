import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Network, 
  UploadCloud, 
  FileText,
  Search,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'rose' | 'cyan' | 'purple';
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Command Center',
    description: 'Threat situation overview & anomaly timeline',
    icon: LayoutDashboard,
  },
  {
    path: '/alerts',
    label: 'Ranked Alerts',
    description: 'Isolation Forest flagged transaction queue',
    icon: AlertTriangle,
    badge: '18 CRIT',
    badgeVariant: 'rose',
  },
  {
    path: '/graph',
    label: 'Interactive Graph',
    description: 'Dedicated IP ↔ TXID ↔ Wallet link analysis',
    icon: Network,
  },
  {
    path: '/upload',
    label: 'Dataset Ingestion',
    description: 'Batch upload & 5-stage pipeline runner',
    icon: UploadCloud,
  },
  {
    path: '/reports',
    label: 'Investigation Reports',
    description: 'Evidentiary dossier & PDF export',
    icon: FileText,
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="no-print hidden lg:flex flex-col w-64 border-r border-white/10 bg-slate-950/80 backdrop-blur-2xl p-4 shrink-0 transition-all duration-300 shadow-2xl relative z-20">
      {/* Investigation Section Navigation */}
      <div className="space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          Forensic Workspaces
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 text-xs font-mono border',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-white border-cyan-400/40 shadow-[0_8px_20px_-4px_rgba(6,182,212,0.3)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/05 border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                          : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">{item.label}</div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border',
                        item.badgeVariant === 'rose' && 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                        item.badgeVariant === 'cyan' && 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                        item.badgeVariant === 'purple' && 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Target Quick Investigation Inset */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 mt-auto">
        <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3 h-3 text-cyan-400" />
          <span>Active Lead</span>
        </div>
        <div className="text-[11px] font-mono text-cyan-300 truncate">
          bc1q9v02...0p2k9
        </div>
        <NavLink
          to="/investigate/wallet/bc1q9v02mdk6wxh5r8c7z2g4f9y3e1a8x7m4q0p2k9"
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 transition-colors"
        >
          <span>Open Dossier</span>
          <ChevronRight className="w-3 h-3" />
        </NavLink>
      </div>
    </aside>
  );
};
