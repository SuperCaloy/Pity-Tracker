'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Caught by error.tsx:", error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20 mb-2">
            <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <span className="text-red-500/80 font-mono text-xs uppercase tracking-[0.2em] font-semibold">System Fault</span>
          <h2 className="font-display text-3xl md:text-5xl text-foreground font-bold tracking-tight">
            Calculation interrupted.
          </h2>
          <p className="font-sans text-foreground/50 max-w-sm mt-2">
            The probability engine encountered an anomalous variable. Safe parameters have been restored.
          </p>
        </div>

        {/* Technical details (optional / hidden by default in prod, but shown here for context) */}
        <div className="w-full bg-foreground/5 rounded-2xl p-4 ring-1 ring-foreground/10 text-left overflow-x-auto max-h-32">
          <pre className="text-[10px] font-mono text-foreground/40">{error.message || 'Unknown exception'}</pre>
        </div>

        <button
          onClick={() => reset()}
          className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground text-background px-8 py-4 font-display text-base tracking-wide shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="relative z-10">Reboot System</span>
          <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/20 transition-transform duration-500 group-hover:rotate-180">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </div>
        </button>
      </div>
    </div>
  );
}
