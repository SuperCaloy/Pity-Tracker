import { describe, it, expect } from 'vitest';
import { PRESETS } from '../config/presets';
import { resolveWinRate } from '../config/resolve-win-rate';

describe('Tamper Guard (Sprint 4)', () => {
  it('validates that winRate <= 1, hardPity <= 2000, and Σ featured.rate ≈ resolvedWinRate * baseRate', () => {
    for (const preset of PRESETS) {
      const { curve, activeBanner } = preset;
      
      expect(curve.winRate || 1, `Preset ${preset.id} winRate > 1`).toBeLessThanOrEqual(1);
      expect(curve.hardPity, `Preset ${preset.id} hardPity > 2000`).toBeLessThanOrEqual(2000);
      
      let sumFeaturedRate = 0;
      for (const item of activeBanner.featured) {
        sumFeaturedRate += item.rate;
      }

      // 50/50 model implies the combined rate-up is baseRate * winRate,
      // EXCEPT when we have a specialized `rateUpProb` (e.g. Weapon banners with 75%).
      const combinedWinRate = curve.rateUpProb ?? curve.winRate ?? 1;
      const expectedTotalFeaturedRate = curve.baseRate * combinedWinRate;

      // Allow a tiny floating point tolerance
      const diff = Math.abs(sumFeaturedRate - expectedTotalFeaturedRate);
      expect(diff, `Preset ${preset.id} failed tamper guard: sum of featured rates (${sumFeaturedRate}) != expected (${expectedTotalFeaturedRate})`).toBeLessThan(1e-9);
    }
  });
});
