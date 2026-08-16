'use client';

import { Card } from '../ui/Card';

export function ThresholdCards({ thresholds }: { thresholds?: { p50: number, p80: number, p95: number } }) {
  const displayThresholds = [
    { label: "AVERAGE LUCK (50%)", pulls: thresholds?.p50 === Infinity ? 'N/A' : (thresholds?.p50 || 0), highlight: false, highlightWarning: false },
    { label: "GOOD ODDS (80%)", pulls: thresholds?.p80 === Infinity ? 'N/A' : (thresholds?.p80 || 0), highlight: true, highlightWarning: false },
    { label: "NEAR GUARANTEE (95%)", pulls: thresholds?.p95 === Infinity ? 'N/A' : (thresholds?.p95 || 0), highlight: false, highlightWarning: true },
  ];

  return (
    <div className="relative w-full rounded-[2rem] bg-foreground/5 p-1.5 ring-1 ring-foreground/10 transition-colors duration-700 h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full h-full rounded-[calc(2rem-6px)] bg-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden divide-y md:divide-y-0 md:divide-x divide-foreground/10">
        {displayThresholds.map((t) => (
          <div key={t.label} className={`flex flex-col justify-center items-center text-center p-6 md:p-8 transition-colors ${t.highlight ? "bg-accent/5" : ""}`}>
            <div className="font-display text-[10px] md:text-xs font-semibold uppercase tracking-widest text-foreground/50 mb-2">{t.label}</div>
            <div className="flex items-baseline gap-2">
              <span className={`font-mono text-3xl md:text-4xl lg:text-5xl tracking-tight font-bold tabular-nums drop-shadow-sm ${t.highlightWarning ? "text-[#35C58A]" : t.highlight ? "text-[#35C58A]" : "text-foreground"}`}>
                {t.pulls}
              </span>
              <span className="text-sm font-sans font-medium text-foreground/40">pulls</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}