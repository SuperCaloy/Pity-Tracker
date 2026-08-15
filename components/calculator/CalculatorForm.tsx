'use client';

import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function CalculatorForm({ onSimulate }: { onSimulate?: () => void }) {
  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex flex-col gap-3">
        <label htmlFor="preset" className="text-sm font-sans font-medium text-foreground/80">Game Preset</label>
        <div className="relative w-full rounded-2xl bg-foreground/5 p-1 ring-1 ring-foreground/10 transition-colors duration-700 ease-awwwards">
          <select
            id="preset"
            className="flex h-12 w-full rounded-[calc(1rem-4px)] bg-surface px-4 py-2 text-base font-sans shadow-core focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent tabular-nums text-foreground transition-all duration-700 ease-awwwards appearance-none cursor-pointer"
            defaultValue="genshin"
          >
            <option className="bg-background text-foreground" value="genshin">Genshin Impact / HSR (0.6%)</option>
            <option className="bg-background text-foreground" value="arknights">Arknights (2.0%)</option>
            <option className="bg-background text-foreground" value="fgo">FGO (1.0%)</option>
          </select>
          {/* Custom Select Chevron */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="targetPulls" className="text-sm font-sans font-medium text-foreground/80">Available Pulls</label>
        <Input id="targetPulls" type="number" inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 160" defaultValue={90} min={1} />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="pityOffset" className="text-sm font-sans font-medium text-foreground/80">Current Pity</label>
        <Input id="pityOffset" type="number" inputMode="numeric" pattern="[0-9]*" placeholder="0" defaultValue={0} min={0} />
      </div>

      {/* Accessible touch target wrapper (min 44px height) */}
      <div className="flex items-center min-h-[44px]">
        <label htmlFor="guarantee" className="flex items-center gap-4 cursor-pointer w-full group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              id="guarantee"
              className="peer h-6 w-6 cursor-pointer appearance-none rounded-[6px] border border-foreground/10 bg-foreground/5 checked:border-accent checked:bg-accent/20 transition-all duration-700 ease-awwwards focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background group-hover:bg-foreground/10"
            />
            <svg aria-hidden="true" className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-accent transition-opacity duration-300" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-sans font-medium text-foreground">
            On Guarantee (Next 5★ is Rate-Up)
          </span>
        </label>
      </div>

      <Button size="lg" className="mt-4 font-display" onClick={onSimulate}>Run Simulation</Button>
    </div>
  );
}