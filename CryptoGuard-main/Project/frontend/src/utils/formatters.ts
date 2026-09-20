/**
 * Formatting utilities for Bitcoin units, cryptographic hashes, and timestamps
 */

/**
 * Truncate long Bitcoin addresses and TXIDs for clean UI display
 */
export function truncateHash(hash: string, startChars: number = 8, endChars: number = 8): string {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Format BTC amount with proper precision
 */
export function formatBtc(amount: number | undefined | null, precision: number = 6): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.000000 BTC';
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: precision,
  })} BTC`;
}

/**
 * Convert satoshis to BTC string
 */
export function satoshisToBtc(satoshis: number): string {
  if (!satoshis) return '0.00000000 BTC';
  const btc = satoshis / 100_000_000;
  return `${btc.toFixed(8)} BTC`;
}

/**
 * Format estimated USD (provisional)
 */
export function formatUsd(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format ISO timestamp into clean analyst format (UTC)
 */
export function formatTimestamp(isoString: string | undefined | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return isoString;
  }
}

/**
 * Format relative time (e.g. "4m ago", "2h ago")
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  } catch {
    return 'recently';
  }
}

/**
 * Format file size in bytes into human readable KB/MB
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
