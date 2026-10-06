import { describe, it, expect } from 'vitest';
import { getRarityZone } from './rarity-zone';

describe('getRarityZone', () => {
  it('returns Void below 50', () => {
    expect(getRarityZone(42.1)).toEqual({ name: 'Void', textClass: 'text-foreground/50', strokeClass: 'stroke-foreground/10', hex: '' });
  });
  it('returns Jade at 50+', () => expect(getRarityZone(50).name).toBe('Jade'));
  it('returns Amethyst at 80+', () => expect(getRarityZone(80).name).toBe('Amethyst'));
  it('returns Gold at 95+', () => expect(getRarityZone(95).name).toBe('Gold'));
});