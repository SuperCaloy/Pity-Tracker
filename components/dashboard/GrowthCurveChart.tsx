'use client';

import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

export function GrowthCurveChart() {
  return (
    <Card className="w-full">
      <div className="flex flex-col space-y-1.5 mb-8">
        <h3 className="font-display text-2xl leading-none tracking-tight text-foreground">Probability Curve</h3>
      </div>
      
      {/* Chart container with padding for axes */}
      <div className="relative h-[200px] md:h-[300px] w-full pl-8 pb-6">
        
        {/* The actual chart area with borders */}
        <div className="relative h-full w-full border-b border-l border-foreground/10">
          {/* Rarity bands */}
          <div className="absolute bottom-0 left-0 h-full w-[73%] bg-background opacity-50" />
          <div className="absolute bottom-0 left-[73%] h-full w-[17%] bg-accent/10" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
            {/* Grid lines */}
            <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-foreground/5" />
            <line x1="0" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="0.5" className="text-foreground/5" />
            <line x1="0" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-foreground/5" />
            <line x1="0" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="0.5" className="text-foreground/5" />

            {/* Guarantee Band */}
            <rect x="73" y="0" width="17" height="100" className="fill-accent/5" />
            <line x1="73" y1="0" x2="73" y2="100" className="stroke-accent/20" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="90" y1="0" x2="90" y2="100" className="stroke-accent/20" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* The Curve */}
            <motion.path
              d="M 0 98 Q 60 98, 73 95 C 80 90, 85 50, 90 20 C 92 5, 95 0, 100 0"
              fill="none"
              className="stroke-foreground"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: [0.32, 0.72, 0, 1], delay: 0.5 }}
            />

            {/* Current Pity Indicator */}
            <circle cx="20" cy="97" r="2" className="fill-accent" />
            <circle cx="20" cy="97" r="4" className="fill-accent/30 animate-pulse" />
          </svg>
        </div>

        {/* X-axis labels (bottom) */}
        <div className="absolute bottom-0 left-8 right-0 h-6 flex justify-between items-end">
          <span className="text-[10px] font-mono text-foreground/50 tabular-nums translate-y-full pt-1">0</span>
          <span className="text-[10px] font-mono text-foreground/50 tabular-nums absolute left-[73%] -translate-x-1/2 translate-y-full pt-1">73</span>
          <span className="text-[10px] font-mono text-foreground/50 tabular-nums absolute left-[90%] -translate-x-1/2 translate-y-full pt-1">90</span>
        </div>
        
        {/* Y-axis labels (left) */}
        <div className="absolute top-0 left-0 bottom-6 w-8 pr-2 flex flex-col justify-between items-end pb-[1px]">
          <span className="text-[10px] font-mono text-foreground/50 tabular-nums leading-none -translate-y-1/2 mt-[2px]">100%</span>
          <span className="text-[10px] font-mono text-foreground/50 tabular-nums leading-none translate-y-1/2">0%</span>
        </div>
      </div>
    </Card>
  );
}