'use client';

import { PRESETS } from '@/lib/config/presets';

export interface CalculatorFormProps {
  preset: string;
  setPreset: (val: string) => void;
  pulls: string | number;
  setPulls: (val: string | number) => void;
  pityOffset: string | number;
  setPityOffset: (val: string | number) => void;
  guarantee: boolean;
  setGuarantee: (val: boolean) => void;
  targetItemName: string | undefined;
  setTargetItemName: (val: string | undefined) => void;
}

export function CalculatorForm({
  preset, setPreset,
  pulls, setPulls,
  pityOffset, setPityOffset,
  guarantee, setGuarantee,
  targetItemName, setTargetItemName
}: CalculatorFormProps) {

  const activePreset = PRESETS.find(p => p.id === preset) || PRESETS[0];
  const hardPity = activePreset.curve?.hardPity || 90;
  const isPityOverLimit = Number(pityOffset) >= hardPity;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <label htmlFor="preset" className="text-xs font-display uppercase tracking-widest font-semibold text-foreground/60 ml-2">Game Preset</label>
        {/* Double-Bezel Outer Shell */}
        <div className="relative w-full rounded-[2rem] bg-foreground/5 p-1.5 ring-1 ring-foreground/10 transition-colors duration-700">
          {/* Inner Core */}
          <select
            id="preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="flex h-14 w-full rounded-[calc(2rem-6px)] bg-surface px-6 py-2 text-base font-sans font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent text-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] appearance-none cursor-pointer"
          >
            {PRESETS.map((p) => (
              <option key={p.id} className="bg-background text-foreground" value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {/* Custom Select Chevron */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Active Banner Info */}
        {activePreset?.activeBanner && (
          <div className="flex flex-col gap-3 ml-1 mt-2 bg-foreground/5 p-4 rounded-2xl border border-foreground/10 transition-colors duration-700">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-foreground/50 tracking-widest uppercase font-semibold">Active Banner</span>
              <span className="text-sm font-sans font-medium text-foreground/90">{activePreset.activeBanner.name || 'TBD'}</span>
            </div>
            
            {activePreset.activeBanner.featured && activePreset.activeBanner.featured.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-foreground/50 tracking-widest uppercase font-semibold">Featured Items (Select Target)</span>
                <div className="flex flex-wrap gap-2">
                  {activePreset.activeBanner.featured.map((f, i) => {
                    const isSelected = targetItemName === f.name;
                    return (
                      <button 
                        key={i}
                        onClick={() => setTargetItemName(isSelected ? undefined : f.name)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98] ${
                          isSelected 
                            ? 'bg-accent/10 border-accent/30 ring-1 ring-accent/30' 
                            : 'bg-background/50 border-foreground/10 hover:border-foreground/30 hover:bg-background/80'
                        }`}
                      >
                        <span className={`text-xs font-medium transition-colors duration-500 ${isSelected ? 'text-accent' : 'text-foreground/80'}`}>
                          {f.name || 'Unknown'}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md transition-colors duration-500 ${
                          isSelected ? 'text-accent bg-accent/20' : 'text-accent bg-accent/10'
                        }`}>
                          {((f.rate || 0) * 100).toFixed(1)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="targetPulls" className="text-xs font-display uppercase tracking-widest font-semibold text-foreground/60 ml-2">Available Pulls</label>
        {/* Double-Bezel Outer Shell */}
        <div className="relative w-full rounded-[2rem] bg-foreground/5 p-1.5 ring-1 ring-foreground/10 transition-colors duration-700">
          <input
            id="targetPulls"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={pulls}
            onChange={(e) => setPulls(e.target.value)}
            min={1}
            className="flex h-14 w-full rounded-[calc(2rem-6px)] bg-surface px-6 py-2 text-lg font-mono font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent text-foreground disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-foreground/20 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 relative">
        <div className="flex flex-col ml-2">
          <label htmlFor="pityOffset" className="text-xs font-display uppercase tracking-widest font-semibold text-foreground/60">Current Pity</label>
        </div>
        {/* Double-Bezel Outer Shell */}
        <div className={`relative w-full rounded-[2rem] p-1.5 ring-1 transition-colors duration-700 ${isPityOverLimit ? 'bg-red-500/10 ring-red-500/30' : 'bg-foreground/5 ring-foreground/10'}`}>
          <input
            id="pityOffset"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={pityOffset}
            onChange={(e) => setPityOffset(e.target.value)}
            onBlur={() => {
              if (Number(pityOffset) >= hardPity) {
                setPityOffset(hardPity - 1);
              }
            }}
            min={0}
            max={hardPity - 1}
            className={`flex h-14 w-full rounded-[calc(2rem-6px)] px-6 py-2 text-lg font-mono font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isPityOverLimit ? 'bg-red-950/20 text-red-400 placeholder:text-red-500/30' : 'bg-surface text-foreground placeholder:text-foreground/20'}`}
          />
        </div>
        <div className="flex justify-between items-start ml-2 mt-1">
          <span className="text-xs text-foreground/40">Pulls since your last 5-star character.</span>
          {isPityOverLimit && (
            <span className="text-[10px] font-semibold tracking-wider uppercase text-red-400 max-w-[120px] text-right">
              Exceeds hard pity ({hardPity})
            </span>
          )}
        </div>
      </div>

      {/* Accessible touch target wrapper */}
      <div className="flex items-center min-h-[44px] mt-4 ml-2">
        <label htmlFor="guarantee" className="flex items-center gap-4 cursor-pointer w-full group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              id="guarantee"
              checked={guarantee}
              onChange={(e) => setGuarantee(e.target.checked)}
              className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border border-foreground/20 bg-transparent checked:border-[#35C58A] checked:bg-[#35C58A] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.1] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
            <svg aria-hidden="true" className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100 text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-sans font-medium text-foreground/80 group-hover:text-foreground transition-colors">
            On Guarantee (Next 5★ is Rate-Up)
          </span>
        </label>
      </div>
    </div>
  );
}