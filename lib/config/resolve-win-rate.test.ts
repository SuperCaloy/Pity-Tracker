import { describe, it, expect } from 'vitest';
import { PRESETS } from './presets';
import { resolveWinRate } from './resolve-win-rate';

describe('resolveWinRate', () => {
  const genshin = PRESETS.find(p => p.id === 'genshin')!;
  const bluearchive = PRESETS.find(p => p.id === 'bluearchive')!;

  it('returns preset winRate when no target is selected', () => {
    expect(resolveWinRate(genshin)).toBe(0.5);
    expect(resolveWinRate(genshin, undefined)).toBe(0.5);
    expect(resolveWinRate(bluearchive)).toBe(1);
  });

  it('returns item share of base rate when a target is selected', () => {
    expect(resolveWinRate(genshin, 'Odette (New)')).toBe(0.5);
    expect(resolveWinRate(bluearchive, 'Niko (Limited)')).toBe(1);
  });

  it('falls back to preset winRate for unknown or invalid targets', () => {
    expect(resolveWinRate(genshin, 'Not A Real Character')).toBe(0.5);
    expect(resolveWinRate(genshin, '')).toBe(0.5);
  });
});
