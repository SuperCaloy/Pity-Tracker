import Link from 'next/link';
import { HowItWorksMotion } from '@/components/HowItWorksMotion';

export default function HowItWorksPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16 flex flex-col gap-12">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        How the pity tracker works
      </h1>

      <HowItWorksMotion>
      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold">What is gacha?</h2>
        <p className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl">
          A randomized in-game banner system. Each pull, wish, or summon has a
          small chance to grant a rare item, and each game publishes roughly how
          that chance behaves.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold">What is pity?</h2>
        <p className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl">
          A safety net. After a long streak of misses, the game quietly raises
          your odds, and after a set number of pulls a rare item is guaranteed.
          This tool models that safety net.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold">What this tool does</h2>
        <p className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl">
          You enter your pull count, your current pity offset, and whether you
          already hold a guarantee. The tracker computes your exact chance of a
          featured item, the odds of winning within your budget, and common
          thresholds: about even odds (p50), a solid chance (p80), and
          near-certain (p95).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold">How to use it</h2>
        <ol className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl list-decimal pl-6 flex flex-col gap-2">
          <li>Pick your game banner.</li>
          <li>Enter your pulls and pity offset.</li>
          <li>Optionally add a budget.</li>
          <li>Hit Calculate Results, then read the runway bar, success gauge, and threshold cards.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold">What it cannot know</h2>
        <p className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl">
          These are published-model probabilities, not promises. Real luck is
          real. Where a game publishes its official rate curve, this tool uses
          it.
        </p>
      </section>
      </HowItWorksMotion>

      <Link
        href="/tracker"
        className="group relative flex w-fit items-center justify-center gap-3 overflow-hidden rounded-full bg-foreground px-8 py-4 font-display text-base tracking-wide text-background shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="relative z-10">Start tracking</span>
        <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/20 transition-transform duration-500 group-hover:translate-x-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </Link>
    </main>
  );
}
