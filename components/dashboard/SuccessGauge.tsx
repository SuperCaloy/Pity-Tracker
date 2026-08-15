'use client';

import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

export function SuccessGauge({ percentage = 42.1 }: { percentage?: number }) {
  return (
    <Card className="border-none bg-surface/50 p-6 flex flex-col items-center justify-center gap-4">
      <div className="relative flex h-48 w-48 items-center justify-center">
        {/* Track */}
        <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className="stroke-surface-border"
            strokeWidth="10"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className="stroke-accent"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="283"
            animate={{ strokeDashoffset: 283 - (283 * percentage) / 100 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-5xl font-bold tracking-tight text-foreground tabular-nums">
            {percentage}%
          </span>
          <span className="font-sans text-xs uppercase tracking-widest text-foreground/50 mt-2">
            Success Rate
          </span>
        </div>
      </div>
    </Card>
  );
}