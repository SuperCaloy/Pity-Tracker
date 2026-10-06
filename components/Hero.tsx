'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function Hero() {
  const reducedMotion = useReducedMotion();
  const ease: [number, number, number, number] = [0.32, 0.72, 0, 1];

  const item = (delay: number) => ({
    initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: reducedMotion
      ? { duration: 0.01 }
      : { duration: 0.8, delay, ease },
  });

  return (
    <main className="relative flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center overflow-hidden">
      {/* Ambient background: slow jade wash, theme-aware, static under reduced motion */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          reducedMotion ? '' : 'animate-[heroDrift_24s_ease-in-out_infinite_alternate]'
        } bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--accent)/0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--accent)/0.22),transparent_70%)]`}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
        <motion.p
          {...item(0)}
          className="font-mono text-xs uppercase tracking-[0.3em] text-accent"
        >
          Gacha analytics
        </motion.p>

        <motion.h1
          {...item(0.1)}
          className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl"
        >
          Know your odds before you spend.
        </motion.h1>

        <motion.p
          {...item(0.2)}
          className="max-w-xl font-sans text-base text-foreground/50 md:text-lg"
        >
          Pity Tracker computes exact pull probabilities, soft-pity curves, and
          threshold odds for Genshin and other gacha banners. No accounts, no
          guesswork.
        </motion.p>

        <motion.div {...item(0.3)} className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/tracker"
            className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-foreground px-8 py-4 font-display text-base tracking-wide text-background shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">Start Tracking</span>
            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/20 transition-transform duration-500 group-hover:translate-x-1">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
          <Link
            href="/how-it-works"
            className="font-sans text-sm text-foreground/50 underline-offset-4 transition-colors duration-700 hover:text-foreground hover:underline"
          >
            See how it works
          </Link>
        </motion.div>
      </div>

    </main>
  );
}
