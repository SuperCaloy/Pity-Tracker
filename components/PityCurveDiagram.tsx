'use client';

import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { getRate } from '@/lib/math/rate-model';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const BASE_RATE = 0.006;
const SOFT_START = 74;
const HARD_PITY = 90;
const RAMP_RATE = 0.06;
const BAR_COUNT = 90;
const STAGGER = 0.008;
const BAR_MS = 0.2;

function barColor(pull: number): string {
  if (pull >= HARD_PITY) return 'bg-rarity-gold';
  if (pull >= SOFT_START) return 'bg-rarity-amethyst';
  return 'bg-rarity-jade';
}

function PercentCountUp({
  value,
  active,
  reduced,
}: {
  value: number;
  active: boolean;
  reduced: boolean;
}) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${v.toFixed(1)}%`);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      type: 'spring',
      damping: 25,
      stiffness: 100,
      mass: 0.8,
      bounce: 0.15,
    });
    return () => controls.stop();
  }, [active, value, reduced, mv]);

  return <motion.span className="tabular-nums">{text}</motion.span>;
}

const Y_TICKS = [100, 75, 50, 25, 0.6];
const X_TICKS_FULL = [1, 37, 73, 74, 80, 89, 90];
const X_TICKS_COMPACT = [1, 74, 90];

export function PityCurveDiagram() {
  const reduced = useReducedMotion();
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true, margin: '-100px' });
  const active = reduced || inView;

  const pulls = Array.from({ length: BAR_COUNT }, (_, i) => {
    const k = i + 1;
    const rate = getRate(k, BASE_RATE, SOFT_START, RAMP_RATE, HARD_PITY);
    return { k, rate, pct: rate * 100 };
  });

  const hidden = { opacity: 0, scaleY: 0 };
  const shown = { opacity: 1, scaleY: 1 };

  return (
    <section aria-labelledby="pity-curve-heading">
      <h2 id="pity-curve-heading" className="font-display text-xl md:text-2xl font-bold">
        What 90 pulls looks like, Genshin example
      </h2>
      <figure className="mt-4 w-full max-w-full overflow-hidden rounded-2xl bg-surface p-6 ring-1 ring-foreground/10">
        <div
          ref={chartRef}
          role="img"
          aria-label="Your chance on each pull, for a Genshin banner that hands you the rare item on pull 90. Pulls 1 to 73 stay at 0.6 percent. Pulls 74 to 89 get better with every pull, from 6.6 percent up to 96.6 percent. Pull 90 always gives it to you."
        >
          <div className="flex gap-2">
            <div aria-hidden="true" className="relative h-40 w-11 shrink-0 md:h-48">
              {Y_TICKS.map((t) => (
                <span
                  key={t}
                  className="absolute right-0 font-mono text-[11px] tabular-nums text-foreground/70"
                  style={{ bottom: `${t}%`, transform: 'translateY(50%)' }}
                >
                  {t}%
                </span>
              ))}
            </div>
            <div className="relative min-w-0 flex-1">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {Y_TICKS.map((t) => (
                  <div
                    key={t}
                    className="absolute left-0 right-0 border-t border-foreground/10"
                    style={{ bottom: `${t}%` }}
                  />
                ))}
                <div
                  className="absolute top-0 bottom-0 w-px bg-foreground/30"
                  style={{ left: `${(73 / BAR_COUNT) * 100}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-px bg-foreground/30"
                  style={{ left: `${(89 / BAR_COUNT) * 100}%` }}
                />
              </div>
              <div className="flex h-40 items-end gap-[2px] md:h-48 md:gap-1">
                {pulls.map(({ k, pct }, i) => (
                  <motion.div
                    key={k}
                    className={`min-w-0 flex-1 rounded-t-sm ${barColor(k)}`}
                    style={{ height: `${pct}%`, minHeight: '6px', transformOrigin: 'bottom' }}
                    initial={reduced ? false : hidden}
                    animate={active ? shown : hidden}
                    transition={
                      reduced
                        ? { duration: 0.01 }
                        : { duration: BAR_MS, delay: i * STAGGER, ease: EASE }
                    }
                  />
                ))}
              </div>
              <div aria-hidden="true" className="mt-2 hidden justify-between font-mono text-[11px] tabular-nums text-foreground/70 sm:flex">
                {X_TICKS_FULL.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div aria-hidden="true" className="mt-2 flex justify-between font-mono text-[11px] tabular-nums text-foreground/70 sm:hidden">
                {X_TICKS_COMPACT.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <p aria-hidden="true" className="mt-1 text-xs text-foreground/70">
                Pull number
              </p>
            </div>
          </div>
          <div aria-hidden="true" className="mt-4 flex flex-wrap gap-2 text-xs text-foreground/70">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rarity-jade" /> 1 to 73 flat
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rarity-amethyst" /> 74 to 89 climbs
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rarity-gold" /> 90 guaranteed
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:gap-6">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-2xl font-bold tabular-nums text-foreground">
              <PercentCountUp value={0.6} active={active} reduced={reduced} />
            </div>
            <p className="mt-1 text-sm text-foreground/70">Pulls 1 to 73. Same tiny chance.</p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-2xl font-bold tabular-nums text-foreground">
              <PercentCountUp value={42.6} active={active} reduced={reduced} />
            </div>
            <p className="mt-1 text-sm text-foreground/70">Pull 80. Each miss raises the next pull.</p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-2xl font-bold tabular-nums text-foreground">
              <PercentCountUp value={100} active={active} reduced={reduced} />
            </div>
            <p className="mt-1 text-sm text-foreground/70">Pull 90. Rule, not luck.</p>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Your chance on each pull for the Genshin 90 pull example
          </caption>
          <thead>
            <tr className="border-b border-foreground/10 text-xs uppercase tracking-wider text-foreground/70">
              <th scope="col" className="py-2 pr-4 font-semibold">Pulls</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Chance each pull</th>
              <th scope="col" className="py-2 font-semibold">What it means</th>
            </tr>
          </thead>
          <tbody className="text-foreground/70">
            <tr className="border-b border-foreground/10">
              <td className="py-2 pr-4 tabular-nums">1 to 73</td>
              <td className="py-2 pr-4 tabular-nums">0.6% each pull</td>
              <td className="py-2">Same tiny chance, every time</td>
            </tr>
            <tr className="border-b border-foreground/10">
              <td className="py-2 pr-4 tabular-nums">74 to 89</td>
              <td className="py-2 pr-4 tabular-nums">6.6% up to 96.6%, better each pull</td>
              <td className="py-2">Missing makes the next pull luckier</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 tabular-nums">90</td>
              <td className="py-2 pr-4 tabular-nums">100%</td>
              <td className="py-2">Rule, not luck</td>
            </tr>
          </tbody>
        </table>

        <figcaption className="mt-4 text-sm text-foreground/70">
          <p>Pulls 1 to 73 stay at 0.6 percent. From 74 the chance climbs each pull. Pull 90 is always 100 percent.</p>
          <p className="mt-2">
            The 0.6 percent bars are drawn a little taller than their true size
            so you can see them. Everything taller is drawn to match the real
            chances.
          </p>
          <p className="mt-2">
            This example fits games where your luck builds pull by pull. A few
            games (Blue Archive, NIKKE, FGO, Epic Seven) work differently: they
            hand you the rare item after a fixed number of pulls instead.
            Endfield also stays flat, so it is not part of this example. These
            numbers come from the official rates, but they are still chances,
            not promises.
          </p>
        </figcaption>
      </figure>
    </section>
  );
}
