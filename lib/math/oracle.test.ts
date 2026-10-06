import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PRESETS } from '../config/presets';
import { calculatePity } from './pity-engine';
import { resolveWinRate } from '../config/resolve-win-rate';

interface OracleFixture {
  sourceUrl: string[];
  description: string;
  expectedValueAny: number;
  expectedValueFeatured: number;
  tolerance: number;
}

describe('Accuracy Oracle (Sprint 2 CI Gate)', () => {
  const fixturePath = path.resolve(__dirname, './fixtures/baseline.json');
  const fixtures: Record<string, OracleFixture> = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

  const presetMap: Record<string, string> = {
    'genshin_character': 'genshin',
    'hsr_character': 'hsr',
    'wuwa_character': 'wuwa',
    'zzz_character': 'zzz'
  };

  for (const [key, fixture] of Object.entries(fixtures)) {
    it(`[${key}] matches community empirical EV`, () => {
      const presetId = presetMap[key];
      const preset = PRESETS.find(p => p.id === presetId);
      if (!preset) throw new Error(`Preset not found: ${presetId}`);

      // Test 1: "Any 5-star" (Win rate = 1)
      const resAny = calculatePity({
        ...preset.curve,
        pullsInput: 180, // High enough to cover guarantee limits
        winRate: 1 // Force 100% win rate to measure "Any 5-star"
      });

      expect(resAny.expectedValue).toBeGreaterThan(0); // Sanity check
      const diffAny = Math.abs(resAny.expectedValue - fixture.expectedValueAny);
      expect(diffAny).toBeLessThanOrEqual(fixture.tolerance);

      // Test 2: "Featured 5-star" (Actual win rate, usually 0.5)
      const resolvedWinRate = resolveWinRate(preset);
      const resFeatured = calculatePity({
        ...preset.curve,
        pullsInput: 180,
        winRate: resolvedWinRate,
        has50_50: preset.curve.has50_50
      });
      
      console.log(`[${key}] Any EV: ${resAny.expectedValue}, Featured EV: ${resFeatured.expectedValue}`);
      console.log(`[${key}] Curve len: ${resFeatured.curve.length}`);
      
      const diffFeatured = Math.abs(resFeatured.expectedValue - fixture.expectedValueFeatured);
      expect(diffFeatured).toBeLessThanOrEqual(fixture.tolerance);
    });
  }
});
