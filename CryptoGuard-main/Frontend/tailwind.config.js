/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#06080e',
          darker: '#030508',
          card: 'rgba(11, 17, 30, 0.72)',
          elevated: 'rgba(18, 27, 46, 0.85)',
          glass: 'rgba(15, 23, 42, 0.60)',
        },
        border: {
          glass: 'rgba(255, 255, 255, 0.08)',
          'glass-bright': 'rgba(255, 255, 255, 0.16)',
          cyan: 'rgba(6, 182, 212, 0.35)',
          rose: 'rgba(244, 63, 94, 0.35)',
          amber: 'rgba(245, 158, 11, 0.35)',
        },
        cyber: {
          cyan: '#06b6d4',
          'cyan-bright': '#22d3ee',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          purple: '#a855f7',
        },
        severity: {
          critical: '#f43f5e',
          high: '#f59e0b',
          medium: '#38bdf8',
          low: '#10b981',
          neutral: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 2px 10px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.65), inset 0 1px 2px 0 rgba(255, 255, 255, 0.15)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
        'glass-heavy': '24px',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)' },
        }
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'radar-sweep': 'radar-sweep 8s linear infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
