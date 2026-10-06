'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { getRarityZone } from '@/lib/rarity-zone';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function AnimatedNumber({ value }: { value: number | 'N/A' }) {
  const reducedMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    if (typeof value !== 'number') {
      motionValue.set(0);
      return;
    }

    if (reducedMotion) {
      motionValue.set(value);
      return;
    }

    const controls = animate(motionValue, value, { type: "spring", damping: 25, stiffness: 100, mass: 0.8, bounce: 0.15 });
    return () => controls.stop();
  }, [value, reducedMotion]);

  if (typeof value !== 'number') {
    return <>N/A</>;
  }

  return <motion.span>{display}</motion.span>;
}

export function ThresholdCards({ thresholds }: { thresholds?: { p50: number, p80: number, p95: number } }) {
  const displayThresholds: { label: string, pulls: number | 'N/A', zone: ReturnType<typeof getRarityZone> }[] = [
    { label: "AVERAGE LUCK (50%)", pulls: thresholds?.p50 === Infinity ? 'N/A' : (thresholds?.p50 || 0), zone: getRarityZone(50) },
    { label: "GOOD ODDS (80%)", pulls: thresholds?.p80 === Infinity ? 'N/A' : (thresholds?.p80 || 0), zone: getRarityZone(80) },
    { label: "NEAR GUARANTEE (95%)", pulls: thresholds?.p95 === Infinity ? 'N/A' : (thresholds?.p95 || 0), zone: getRarityZone(95) },
  ];

  return (
    <div className="relative w-full rounded-[2rem] bg-foreground/5 p-1.5 ring-1 ring-foreground/10 transition-colors duration-700 h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full h-full rounded-[calc(2rem-6px)] bg-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden divide-y md:divide-y-0 md:divide-x divide-foreground/10">
        {displayThresholds.map((t) => (
          <div key={t.label} className="flex flex-col justify-center items-center text-center p-6 md:p-8 transition-colors">
            <div className="font-display text-[10px] md:text-xs font-semibold uppercase tracking-widest text-foreground/50 mb-2">{t.label}</div>
            <div className="flex items-baseline gap-2">
              <span className={`font-mono text-3xl md:text-4xl lg:text-5xl tracking-tight font-bold tabular-nums drop-shadow-sm ${t.zone.textClass}`}>
                <AnimatedNumber value={t.pulls} />
              </span>
              <span className="text-sm font-sans font-medium text-foreground/40">pulls</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}