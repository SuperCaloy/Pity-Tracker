'use client';

import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

export function SuccessGauge({ percentage = 42.1 }: { percentage?: number }) {
  return (
    <div className="relative w-full rounded-[2rem] bg-foreground/5 p-1.5 ring-1 ring-foreground/10 transition-colors duration-700 h-full">
      <div className="flex flex-col items-center justify-center gap-4 h-full w-full rounded-[calc(2rem-6px)] bg-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-6 md:p-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex h-32 w-32 md:h-40 md:w-40 xl:h-48 xl:w-48 items-center justify-center z-10">
          {/* Track SVG - Increased viewBox from 100 to 120 to prevent edge clipping */}
          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              className="stroke-foreground/10"
              strokeWidth="8"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              className="stroke-[#35C58A]"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="314"
              strokeDashoffset="314"
              animate={{ strokeDashoffset: 314 - (314 * percentage) / 100 }}
              transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight text-foreground tabular-nums drop-shadow-sm">
              {percentage}%
            </span>
            <span className="font-display text-[10px] md:text-xs uppercase tracking-widest text-foreground/50 mt-1 md:mt-2 font-semibold">
              Success Rate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}