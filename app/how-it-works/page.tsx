import Link from 'next/link';
import { HowItWorksMotion } from '@/components/HowItWorksMotion';
import { PityCurveDiagram } from '@/components/PityCurveDiagram';

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
          Gacha games sell you random draws. Each pull, wish, or summon has a
          small chance of giving you the rare character or item on the banner,
          and the game makers publish those chances so players know roughly
          how lucky they need to be.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold">What is pity?</h2>
        <p className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl">
          Pity is the safety net hiding behind those draws. The more pulls you
          make without getting the rare item, the better your chances get,
          until the game simply hands it to you after a set number of pulls.
          This tracker does the math on that safety net for you.
        </p>
      </section>

      <PityCurveDiagram />

      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold">What this tool does</h2>
        <p className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl">
          Tell it how many pulls you have saved, how many pulls it has been
          since your last rare item, and whether your next rare item is
          promised to be the featured one. It tells you your chances of
          getting the featured item, how far your budget will stretch, and
          three simple answers: how many pulls give you a coin flip chance,
          a strong chance, and near certainty.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold">How to use it</h2>
        <ol className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl list-decimal pl-6 flex flex-col gap-2">
          <li>Pick your game.</li>
          <li>Enter your saved pulls and how long it has been since your last rare item.</li>
          <li>Add a budget if you want.</li>
          <li>Hit Calculate Results, then read the runway bar, the success rate, and the average luck, good odds, and near guarantee cards.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold">What it cannot know</h2>
        <p className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl">
          These numbers come from the official rates the games publish. They
          are still chances, not promises. Real luck is still luck.
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
