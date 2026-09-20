import React from 'react';
import { cn } from '../../utils/cn';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  isMonospace?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  className,
  leftIcon,
  rightAction,
  isMonospace = false,
  label,
  helperText,
  error,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300 tracking-wide flex items-center justify-between">
          <span>{label}</span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={cn(
            'glass-input w-full px-3.5 py-2 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200',
            leftIcon && 'pl-10',
            rightAction && 'pr-10',
            isMonospace && 'font-mono tracking-tight text-xs',
            error && 'border-rose-500/60 focus:border-rose-400 focus:shadow-glow-rose',
            className
          )}
          {...props}
        />

        {rightAction && (
          <div className="absolute right-3 flex items-center">
            {rightAction}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-400 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};
