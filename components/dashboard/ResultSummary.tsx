'use client';

import { useEffect } from 'react';
import { usePityCalculation } from '@/hooks/usePityCalculation';
import { CalculationInput } from '@/types/pity';

export function ResultSummary({ input, onDismiss }: { input: CalculationInput | null, onDismiss?: () => void }) {
  const calculationResult = usePityCalculation(input);

  useEffect(() => {
    if (!input || !onDismiss) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 60000);
    return () => clearTimeout(timer);
  }, [input, onDismiss]);

  if (!input || !calculationResult) return null;

  const currentPercentage = +(calculationResult.currentP * 100).toFixed(1);
  const thresholds = calculationResult.thresholds;

  // Determine rarity zone
  let zoneName = "Void";
  let zoneColor = "text-foreground/50";
  let activeColor = "hsl(var(--foreground))";
  if (currentPercentage >= 95) { zoneName = "Gold"; zoneColor = "text-[#F0B429]"; activeColor = "#F0B429"; }
  else if (currentPercentage >= 80) { zoneName = "Amethyst"; zoneColor = "text-[#9C7CF4]"; activeColor = "#9C7CF4"; }
  else if (currentPercentage >= 50) { zoneName = "Jade"; zoneColor = "text-[#35C58A]"; activeColor = "#35C58A"; }

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

  const estimatedCost = morePullsNeeded * 3; // Approx $3 per pull

  return (
    <div className="relative w-full rounded-[2rem] bg-foreground/5 p-1.5 ring-1 ring-foreground/10 transition-colors duration-700 shadow-2xl">
      <div className="bg-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[calc(2rem-6px)] p-8 md:p-10 flex flex-col gap-6 relative w-full overflow-hidden">
        
        {/* Top Active Color Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: activeColor }} />
        
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="absolute top-6 right-6 p-2 text-foreground/40 hover:text-foreground transition-colors rounded-full hover:bg-foreground/5"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
        
        <p className="font-sans text-xl md:text-2xl text-foreground/90 leading-relaxed pr-10">
          You currently have a <strong className="text-foreground text-3xl md:text-4xl tabular-nums ml-1 font-display tracking-tight drop-shadow-sm">{currentPercentage}% chance</strong> of success. You are sitting in the <strong className={`ml-1 ${zoneColor}`}>{zoneName} zone</strong>. {tipMessage}
        </p>
        
        {morePullsNeeded > 0 && (
          <div className="flex flex-col gap-2 mt-4 pt-6 border-t border-foreground/10">
            <span className="text-foreground tracking-widest uppercase text-xs font-semibold">Strategic Outlook</span> 
            <p className="font-sans text-base md:text-lg text-foreground/70 leading-relaxed">
              Securing the remaining <strong className="text-foreground font-mono">{morePullsNeeded}</strong> pulls to hit your target will require an estimated budget of <strong className="text-foreground font-mono">~${estimatedCost}</strong>. Plan your resources accordingly to guarantee success.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
