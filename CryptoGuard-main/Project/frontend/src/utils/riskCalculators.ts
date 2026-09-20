/**
 * Risk score & severity calculation and color token mapping
 */

import { SeverityLevel } from '../types/forensics';

/**
 * Determine severity level from 0-100 composite risk score
 */
export function getSeverityFromScore(score: number): SeverityLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

/**
 * Visual styling tokens for each severity level
 */
export interface SeverityStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glowColor: string;
  barColor: string;
}

export const SEVERITY_CONFIG: Record<SeverityLevel, SeverityStyle> = {
  CRITICAL: {
    label: 'CRITICAL',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/30',
    glowColor: 'shadow-glow-rose',
    barColor: '#f43f5e',
  },
  HIGH: {
    label: 'HIGH',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    glowColor: 'shadow-glow-amber',
    barColor: '#f59e0b',
  },
  MEDIUM: {
    label: 'MEDIUM',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
    glowColor: 'shadow-glow-cyan',
    barColor: '#38bdf8',
  },
  LOW: {
    label: 'LOW',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    glowColor: 'shadow-none',
    barColor: '#10b981',
  },
};

/**
 * Format raw anomaly score (e.g. Isolation Forest decision function)
 */
export function formatAnomalyScore(rawScore: number): string {
  // Negative indicates deeper outlier in Isolation Forest
  const sign = rawScore > 0 ? '+' : '';
  return `${sign}${rawScore.toFixed(4)}`;
}
