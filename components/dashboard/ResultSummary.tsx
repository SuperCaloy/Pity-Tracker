'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { CalculationInput, CalculationResult } from '@/types/pity';
import { PRESETS } from '@/lib/config/presets';
import { formatCurrency } from '../../lib/utils';
import { getRarityZone } from '@/lib/rarity-zone';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function ResultSummary({ input, result, onDismiss }: { input: CalculationInput | null, result: CalculationResult | null, onDismiss?: () => void }) {
  const reducedMotion = useReducedMotion();
  const percentageValue = useMotionValue(0);
  const percentageDisplay = useTransform(percentageValue, (v) => `${v.toFixed(1)}%`);

  useEffect(() => {
    return () => {
      percentageValue.set(0);
    };
  }, []);

  const currentPercentage = input && result ? +(result.currentP * 100).toFixed(1) : 0;
  const thresholds = result?.thresholds;

  const zone = getRarityZone(currentPercentage);
  const zoneColor = zone.hex || 'currentColor';

  useEffect(() => {
    if (!input || !result) {
      percentageValue.set(0);
      return;
    }

    if (reducedMotion) {
      percentageValue.set(currentPercentage);
      return;
    }

    const controls = animate(percentageValue, currentPercentage, { type: "spring", damping: 25, stiffness: 100, mass: 0.8, bounce: 0.15 });
    return () => controls.stop();
  }, [input, result, currentPercentage, reducedMotion]);

  if (!input || !result) return null;

  // Tip logic
  let tipMessage = "";
  let morePullsNeeded = 0;

  if (thresholds && currentPercentage < 50) {
    morePullsNeeded = thresholds.p50 - input.pullsInput;
    if (morePullsNeeded > 0) {
      tipMessage = `You need exactly ${morePullsNeeded} more pulls to hit the 50% median.`;
    }
  } else if (thresholds && currentPercentage < 80) {
    morePullsNeeded = thresholds.p80 - input.pullsInput;
    if (morePullsNeeded > 0) {
      tipMessage = `You need exactly ${morePullsNeeded} more pulls to hit the 80% safe target.`;
    }
  } else {
    tipMessage = `You are highly likely to get the character. Good luck!`;
  }

  const preset = PRESETS.find(p => p.id === input.presetId) || PRESETS[0];
  const costPerPull = preset?.pricing?.costPerPull || 0;
  const estimatedCost = formatCurrency(morePullsNeeded * costPerPull, preset?.pricing?.currency || 'PHP');

  return (
    <div className="relative w-full rounded-[2rem] bg-foreground/5 p-1.5 ring-1 ring-foreground/10 transition-colors duration-500 shadow-2xl">
      <div className="bg-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[calc(2rem-6px)] p-8 md:p-10 flex flex-col gap-6 relative w-full overflow-hidden">
        
        {/* Top Active Color Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: zone.hex }} />
        
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="absolute top-6 right-6 p-2 text-foreground/40 hover:text-foreground transition-colors rounded-full hover:bg-foreground/5"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
        
        <p id="result-summary-title" className="font-sans text-xl md:text-2xl text-foreground/90 leading-relaxed pr-10">
          You currently have a <strong className="text-foreground text-3xl md:text-4xl tabular-nums ml-1 font-display tracking-tight drop-shadow-sm"><motion.span>{percentageDisplay}</motion.span> chance</strong> of success. You are sitting in the <motion.strong className="ml-1" initial={{ color: reducedMotion ? zoneColor : 'currentColor' }} animate={{ color: zoneColor }} transition={{ duration: reducedMotion ? 0 : 0.5 }}>{zone.name} zone</motion.strong>. {tipMessage}
        </p>
        
        {morePullsNeeded > 0 && (
          <div className="flex flex-col gap-2 mt-4 pt-6 border-t border-foreground/10">
            <span className="text-foreground tracking-widest uppercase text-xs font-semibold">Strategic Outlook</span> 
            <p className="font-sans text-base md:text-lg text-foreground/70 leading-relaxed">
              Securing the remaining <strong className="text-foreground font-mono">{morePullsNeeded}</strong> pulls to hit your target will require an approximate budget of <strong className="text-foreground font-mono">~{estimatedCost}</strong>. Plan your resources accordingly to guarantee success.
            </p>
            {preset?.pricing?.pricingDisclaimer && (
              <span className="text-xs text-foreground/40 mt-1">
                * {preset.pricing.pricingDisclaimer}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}