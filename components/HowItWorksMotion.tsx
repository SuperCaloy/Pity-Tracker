'use client';

import { Children } from 'react';
import type { ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function SectionReveal({
  index,
  reduced,
  children,
}: {
  index: number;
  reduced: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const isFirst = index === 0;
  const active = isFirst || inView;

  const hidden = { opacity: 0, y: reduced ? 0 : 20 };
  const shown = { opacity: 1, y: 0 };

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={active ? shown : hidden}
      transition={
        reduced
          ? { duration: 0.01 }
          : { duration: isFirst ? 0.8 : 0.5, delay: index * 0.1, ease: EASE }
      }
    >
      {children}
    </motion.div>
  );
}

export function HowItWorksMotion({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <div data-hiw-motion="" className="flex flex-col gap-12">
      <noscript>
        <style>{`[data-hiw-motion] > div { opacity: 1 !important; transform: none !important; filter: none !important; }`}</style>
      </noscript>
      {Children.map(children, (child, index) => (
        <SectionReveal key={index} index={index} reduced={reduced}>
          {child}
        </SectionReveal>
      ))}
    </div>
  );
}
