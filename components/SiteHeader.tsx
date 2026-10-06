'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

// Shared keyboard focus style. Ring uses the ember accent token which
// passes small text contrast in both themes, so it survives the
// transparent top state and the veiled scrolled state.
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md';

export function SiteHeader() {
  // Initial false matches server render, so there is no hydration mismatch.
  // The effect below corrects it on mount if the page loads mid scroll.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 border-b transition-colors duration-700 ease-awwwards ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-foreground/5'
          : 'bg-transparent backdrop-blur-none border-transparent'
      }`}
    >
      <div className="flex items-center gap-2">
        <Link href="/" className={`font-display font-bold text-foreground tracking-tight ${FOCUS_RING}`}>
          PITY TRACKER
        </Link>
      </div>
      <div className="flex items-center gap-4 h-full">
        <Link
          href="/tracker"
          className={`font-sans text-sm text-foreground/60 hover:text-foreground transition-colors duration-700 ${FOCUS_RING}`}
        >
          Tracker
        </Link>
        <Link
          href="/how-it-works"
          className={`font-sans text-sm text-foreground/60 hover:text-foreground transition-colors duration-700 ${FOCUS_RING}`}
        >
          How It Works
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
