'use client';

import { Card } from '../ui/Card';

export function ThresholdCards() {
  const thresholds = [
    { label: "MEDIAN (50%)", pulls: 78, currency: "12,480" },
    { label: "TARGET (80%)", pulls: 115, currency: "18,400", highlight: true },
    { label: "SAFE (99%)", pulls: 158, currency: "25,280", highlightWarning: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {thresholds.map((t) => (
        <Card key={t.label} className={t.highlight ? "border-accent/30 bg-accent/5" : ""}>
          <div className="font-sans text-xs font-semibold tracking-wider text-foreground/50 mb-4">{t.label}</div>
          <div className={`font-mono text-4xl mb-2 tabular-nums ${t.highlightWarning ? "text-accent" : t.highlight ? "text-accent" : "text-foreground"}`}>
            {t.pulls} <span className="text-xl text-foreground/50">Pulls</span>
          </div>
          <div className="font-sans text-sm text-foreground/50">
            {t.currency} Premium Currency
          </div>
        </Card>
      ))}
    </div>
  );
}