import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  Network, 
  Layers, 
  Cpu,
  Radio,
  Zap,
  Activity,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { dashboardService } from '../api/services/dashboardService';
import { alertService } from '../api/services/alertService';
import { DashboardStatistics, Alert } from '../types/forensics';
import { ThreatRadarKPI } from '../components/dashboard/ThreatRadarKPI';
import { AnomalyActivityTimeline } from '../components/dashboard/AnomalyActivityTimeline';
import { RiskDistributionWidget } from '../components/dashboard/RiskDistributionWidget';
import { RecentAlertsWidget } from '../components/dashboard/RecentAlertsWidget';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [statsData, alertsData] = await Promise.all([
          dashboardService.getDashboardStatistics(),
          alertService.getRankedAlerts({ limit: 4, sortBy: 'riskScore', sortOrder: 'desc' }),
        ]);
        setStats(statsData);
        setRecentAlerts(alertsData.items);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Investigation Context Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wide text-white flex items-center gap-3">
            <span>FORENSIC COMMAND CENTER</span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-normal">
              CRYPTOGUARD INVESTIGATION CONSOLE
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time Threat Situation Overview • Common-Input Heuristics • Isolation Forest Outlier Surveillance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/upload">
            <GlassButton variant="secondary" size="sm" leftIcon={<UploadCloud className="w-4 h-4" />}>
              Ingest Batch
            </GlassButton>
          </Link>
          <Link to="/graph">
            <GlassButton variant="primary" size="sm" leftIcon={<Network className="w-4 h-4" />}>
              Explore Entity Graph
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* 1. Top: KPI Threat Radar Metrics */}
      <ThreatRadarKPI stats={stats} isLoading={isLoading} />

      {/* 2. Centerpiece: Anomaly Activity Timeline & Risk Intensity Matrix */}
      <AnomalyActivityTimeline />

      {/* 3. Bottom Grid: Risk Spectrum Breakdown + Priority Threat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <RiskDistributionWidget stats={stats} />
        </div>

        <div className="lg:col-span-7">
          <RecentAlertsWidget alerts={recentAlerts} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
