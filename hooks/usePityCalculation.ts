import { useMemo } from 'react';
import { calculatePity } from '../lib/math/pity-engine';
import { PRESETS } from '../lib/config/presets';
import { CalculationInput, CalculationResult } from '../types/pity';

export function usePityCalculation(input: CalculationInput | null): CalculationResult | null {
  return useMemo(() => {
    if (!input) return null;

    const preset = PRESETS.find(p => p.id === input.baseRatePercent) || PRESETS[0];

    // Offset logic: start at pityOffset
    // We compute the full curve, then slice it or adjust it?
    // Actually, if we are at pityOffset = 12, then our first pull is actually pull 13.
    // For V1, the engine handles pityOffset natively.
    
    const baseRate = preset?.curve?.baseRate || 0.006;
    let dynamicWinRate = preset?.curve?.winRate ?? 0.5;

    if (preset?.activeBanner?.featured && preset.activeBanner.featured.length > 0) {
      if (input.targetItemName) {
        const targetItem = preset.activeBanner.featured.find(f => f.name === input.targetItemName);
        if (targetItem && targetItem.rate) {
          dynamicWinRate = Math.min(1, targetItem.rate / baseRate);
        }
      } else {
        const sumRates = preset.activeBanner.featured.reduce((sum, f) => sum + (f.rate || 0), 0);
        if (sumRates > 0) {
          dynamicWinRate = Math.min(1, sumRates / baseRate);
        }
      }
    }

    const result = calculatePity({
      baseRate,
      softPityStart: preset?.curve?.softPityStart,
      rampRate: preset?.curve?.rampRate,
      hardPity: preset?.curve?.hardPity || 90,
      pullsInput: input.pullsInput,
      pityOffset: input.pityOffset || 0,
      guarantee: input.guarantee || false,
      winRate: dynamicWinRate
    });

    return result;
  }, [input]);
}
