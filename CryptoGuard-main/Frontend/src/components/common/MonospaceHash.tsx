import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { truncateHash } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

export interface MonospaceHashProps {
  hash: string;
  type?: 'address' | 'txid' | 'cluster' | 'ip' | 'generic';
  truncate?: boolean;
  startChars?: number;
  endChars?: number;
  showCopy?: boolean;
  linkToInvestigate?: boolean;
  className?: string;
}

export const MonospaceHash: React.FC<MonospaceHashProps> = ({
  hash,
  type = 'generic',
  truncate = true,
  startChars = 8,
  endChars = 8,
  showCopy = true,
  linkToInvestigate = false,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const displayValue = truncate ? truncateHash(hash, startChars, endChars) : hash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const getHref = () => {
    if (type === 'address') return `/investigate/wallet/${encodeURIComponent(hash)}`;
    if (type === 'txid') return `/investigate/tx/${encodeURIComponent(hash)}`;
    if (type === 'ip') return `/investigate/ip/${encodeURIComponent(hash)}`;
    return `/investigate/generic/${encodeURIComponent(hash)}`;
  };

  const content = (
    <span
      className={cn(
        'font-mono text-xs text-slate-200 hover:text-cyan-300 transition-colors tracking-tight select-all',
        className
      )}
      title={hash}
    >
      {displayValue}
    </span>
  );

  return (
    <span className="inline-flex items-center gap-1.5 group max-w-full">
      {linkToInvestigate ? (
        <Link
          to={getHref()}
          className="inline-flex items-center gap-1 hover:underline text-cyan-400 group-hover:text-cyan-300 shrink"
        >
          {content}
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
        </Link>
      ) : (
        content
      )}

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors shrink-0"
          title="Copy full value"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </span>
  );
};
