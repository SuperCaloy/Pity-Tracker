'use client';

import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

interface PityRunwayProps {
  currentPull: number;
  maxPulls: number;
  softPityStart?: number;
  thresholds?: { p50: number, p80: number, p95: number };
}

export function PityRunway({ currentPull = 0, maxPulls = 180, softPityStart, thresholds }: PityRunwayProps) {
  // Guard against invalid values
  const safeMax = Math.max(1, maxPulls);
  const fillPercentage = Math.min(100, Math.max(0, (currentPull / safeMax) * 100));

  // Determine which milestone is next
  let nextTargetLabel = "Hard Pity";
  let nextTargetPulls = safeMax;
  
  if (thresholds) {
    if (currentPull < thresholds.p50) {
      nextTargetLabel = "Median (50%)";
      nextTargetPulls = thresholds.p50;
    } else if (currentPull < thresholds.p80) {
      nextTargetLabel = "Safe (80%)";
      nextTargetPulls = thresholds.p80;
    } else if (currentPull < thresholds.p95) {
      nextTargetLabel = "Very Safe (95%)";
      nextTargetPulls = thresholds.p95;
    }
  }

  const pullsToTarget = Math.max(0, nextTargetPulls - currentPull);
  const costToTarget = pullsToTarget * 3; // ~$3 per pull

  const renderMarker = (pulls: number, label: string, colorClass: string, position: 'top' | 'bottom' = 'top') => {
    if (!pulls || pulls === Infinity) return null;
    const pos = (pulls / safeMax) * 100;
    // hide if it overlaps end
    if (pos > 98) return null;
    
    return (
      <div 
        className={`absolute w-px border-l border-dashed z-10 flex flex-col justify-center ${position === 'top' ? 'bottom-[60%] top-0' : 'top-[60%] bottom-0'}`}
        style={{ left: `${pos}%`, borderColor: 'currentColor' }}
      >
        <span className={`absolute ${position === 'top' ? '-top-6' : 'bottom-0 -mb-6'} left-1/2 -translate-x-1/2 text-[10px] font-mono whitespace-nowrap ${colorClass}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="relative w-full rounded-[2rem] bg-foreground/5 p-1.5 ring-1 ring-foreground/10 transition-colors duration-700">
      <div className="w-full relative group rounded-[calc(2rem-6px)] bg-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-6 md:p-10 flex flex-col gap-10 md:gap-14">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-10 relative">
          <div className="flex flex-col space-y-2">
            <h3 className="font-display text-3xl md:text-4xl leading-none tracking-tight text-foreground">Pity Runway</h3>
            <p className="text-base text-foreground/50">Your stash mapped against key milestones.</p>
          </div>
          
          {pullsToTarget > 0 ? (
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[10px] md:text-xs text-foreground/40 uppercase tracking-widest font-semibold mb-1">To {nextTargetLabel}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-mono text-foreground tracking-tight">{pullsToTarget}</span>
                <span className="text-sm md:text-base font-sans text-foreground/50 font-medium">pulls</span>
                <span className="text-sm md:text-base text-foreground/30 font-mono ml-2">(~${costToTarget})</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[10px] md:text-xs text-[#F0B429]/60 uppercase tracking-widest font-semibold mb-1">Status</span>
              <span className="text-2xl md:text-3xl font-mono text-[#F0B429] tracking-tight">Guaranteed</span>
            </div>
          )}
        </div>

        <div className="relative w-full pt-8 pb-8">
          {/* Track Background */}
          <div className="h-10 md:h-12 w-full bg-foreground/[0.03] rounded-full relative overflow-hidden ring-1 ring-inset ring-foreground/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]">
            
            {/* Fill Bar */}
            <motion.div 
              className="absolute top-0 bottom-0 left-0 bg-[#35C58A] rounded-full shadow-[0_0_20px_rgba(53,197,138,0.4)] z-20"
              initial={{ width: 0 }}
              animate={{ width: `${fillPercentage}%` }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
            >
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
            </motion.div>

            {/* Markers Inside Track */}
            <div className="absolute inset-0 opacity-20 pointer-events-none z-10">
              {softPityStart && softPityStart < safeMax && (
                <div className="absolute top-0 bottom-0 w-px bg-foreground" style={{ left: `${(softPityStart / safeMax) * 100}%` }} />
              )}
              {thresholds?.p50 && thresholds.p50 < safeMax && (
                <div className="absolute top-0 bottom-0 w-px bg-foreground" style={{ left: `${(thresholds.p50 / safeMax) * 100}%` }} />
              )}
            </div>
          </div>

          {/* Labels Overlay */}
          <div className="absolute inset-0 w-full pointer-events-none flex items-center pt-8 pb-8">
            <div className="relative w-full h-full">
              <span className="absolute left-0 bottom-1/2 -mb-8 text-xs font-mono text-foreground/40 translate-y-full">0</span>
              
              {softPityStart && renderMarker(softPityStart, "Soft Pity", "text-foreground/60", "bottom")}
              {thresholds?.p50 && renderMarker(thresholds.p50, "50%", "text-[#35C58A]", "top")}
              {thresholds?.p80 && renderMarker(thresholds.p80, "80%", "text-[#35C58A]", "top")}
              
              <span className="absolute right-0 bottom-1/2 -mb-8 text-xs font-mono text-foreground/40 translate-y-full">{safeMax}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
