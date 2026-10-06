'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { PRESETS } from '@/lib/config/presets';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PresetListboxProps {
  preset: string;
  setPreset: (val: string) => void;
  labelId: string;
}

const PUBLISHER_DOT: Record<string, string> = {
  HoYoverse: 'bg-rarity-jade',
  'Kuro Games': 'bg-rarity-amethyst',
  Nexon: 'bg-rarity-blue',
  Hypergryph: 'bg-rarity-amethyst',
  'Shift Up': 'bg-rarity-blue',
  Lasengle: 'bg-rarity-gold',
  Smilegate: 'bg-rarity-jade',
  Netmarble: 'bg-accent',
};

const PANEL_MAX_HEIGHT = 320;

function filterPresets(rawQuery: string) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return PRESETS;
  return PRESETS.filter(
    (p) => p.title.toLowerCase().includes(q) || p.publisher.toLowerCase().includes(q)
  );
}

export function PresetListbox({ preset, setPreset, labelId }: PresetListboxProps) {
  const selected = PRESETS.find((p) => p.id === preset) || PRESETS[0];
  const reducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selected.title);
  const [showAll, setShowAll] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const panelId = useId();
  const triggerRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

  const filtered = useMemo(() => {
    if (showAll) return PRESETS;
    return filterPresets(query);
  }, [query, showAll]);

  const clampedIndex = filtered.length === 0 ? 0 : Math.min(activeIndex, filtered.length - 1);
  const activeOption = filtered[clampedIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = rect.width;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow >= PANEL_MAX_HEIGHT + 16 || spaceBelow >= rect.top
        ? rect.bottom + 8
        : Math.max(8, rect.top - PANEL_MAX_HEIGHT - 8);
    setPos({ top, left, width });
  };

  const revertQuery = () => setQuery(selected.title);

  const closePanel = (revert: boolean) => {
    if (revert) revertQuery();
    setOpen(false);
  };

  const openPanel = () => {
    const unchanged = query.trim() === '' || query === selected.title;
    setShowAll(unchanged);
    const list = unchanged ? PRESETS : filterPresets(query);
    const selectedPos = list.findIndex((p) => p.id === selected.id);
    setActiveIndex(selectedPos >= 0 ? selectedPos : 0);
    updatePosition();
    setOpen(true);
  };

  const choose = (id: string) => {
    const next = PRESETS.find((p) => p.id === id) || PRESETS[0];
    setPreset(id);
    setQuery(next.title);
    setShowAll(true);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      closePanel(true);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !activeOption) return;
    optionRefs.current[clampedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [clampedIndex, open, activeOption]);

  const onInputFocus = () => {
    if (!open) openPanel();
  };

  const onInputChange = (value: string) => {
    setQuery(value);
    setShowAll(value.trim() === '');
    setActiveIndex(0);
    if (!open) {
      updatePosition();
      setOpen(true);
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        openPanel();
      } else if (filtered.length > 0) {
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      if (open && filtered.length > 0) {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    } else if (e.key === 'Enter') {
      if (open && activeOption) {
        e.preventDefault();
        choose(activeOption.id);
      } else if (!open) {
        e.preventDefault();
        openPanel();
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        closePanel(true);
      }
    }
  };

  const onBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      closePanel(true);
    }
  };

  return (
    <div onBlur={onBlur}>
      <div className="relative w-full rounded-[2rem] bg-foreground/5 p-1.5 ring-1 ring-foreground/10 transition-colors duration-700">
        <input
          ref={triggerRef}
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-expanded={open}
          aria-controls={panelId}
          aria-autocomplete="list"
          aria-labelledby={labelId}
          aria-activedescendant={open && activeOption ? `${panelId}-opt-${activeOption.id}` : undefined}
          title={selected.title}
          placeholder="Type to search games"
          value={query}
          onFocus={onInputFocus}
          onClick={() => {
            if (!open) openPanel();
          }}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          className="flex h-12 w-full rounded-[calc(2rem-6px)] bg-surface py-2 pl-6 pr-12 text-base font-sans font-medium text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent placeholder:text-foreground/40"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-foreground/50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                ref={panelRef}
                id={panelId}
                role="listbox"
                aria-label={
                  filtered.length === 0
                    ? `No games match ${query}`
                    : `${filtered.length} of ${PRESETS.length} games`
                }
                initial={reducedMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                transition={reducedMotion ? { duration: 0.01 } : { duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                style={{ top: pos.top, left: pos.left, width: pos.width }}
                className="fixed z-40 max-h-[320px] overflow-y-auto overscroll-contain rounded-2xl bg-surface p-1.5 shadow-2xl ring-1 ring-foreground/10"
              >
                <div aria-hidden="true" className="px-3 pb-1 pt-2 text-[11px] tabular-nums text-foreground/50">
                  {filtered.length} of {PRESETS.length}
                </div>
                {filtered.length === 0 ? (
                  <div role="presentation" className="px-3 py-4 text-sm text-foreground/60">
                    No games match &ldquo;{query.trim()}&rdquo;
                  </div>
                ) : (
                  filtered.map((p, i) => {
                    const isSelected = p.id === selected.id;
                    const isActive = i === clampedIndex;
                    return (
                      <div
                        key={p.id}
                        ref={(el) => {
                          optionRefs.current[i] = el;
                        }}
                        id={`${panelId}-opt-${p.id}`}
                        role="option"
                        aria-selected={isSelected}
                        title={p.title}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => choose(p.id)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 outline-none transition-colors duration-150 ${
                          isSelected ? 'bg-accent/10 ring-1 ring-inset ring-accent/30' : ''
                        } ${!isSelected ? 'hover:bg-foreground/5' : ''} ${isActive && !isSelected ? 'bg-foreground/5' : ''}`}
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-xs font-semibold text-foreground/70 ring-1 ring-foreground/10"
                        >
                          {p.publisher.charAt(0)}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`h-2 w-2 shrink-0 rounded-full ${PUBLISHER_DOT[p.publisher] || 'bg-foreground/30'}`}
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-sm font-medium text-foreground">{p.title}</span>
                          <span className="truncate text-xs text-foreground/60">{p.publisher}</span>
                        </span>
                        {isSelected && (
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-accent"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
