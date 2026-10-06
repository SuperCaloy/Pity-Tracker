import { useMemo } from 'react';
import { calculatePity } from '../lib/math/pity-engine';
import { PRESETS } from '../lib/config/presets';
import { resolveWinRate } from '../lib/config/resolve-win-rate';
import { CalculationInput, CalculationResult } from '../types/pity';

export function usePityCalculation(input: CalculationInput | null): CalculationResult | null {
  return useMemo(() => {
    if (!input) return null;

    const preset = PRESETS.find(p => p.id === input.presetId) || PRESETS[0];

    const baseRate = preset?.curve?.baseRate || 0.006;
    const dynamicWinRate = resolveWinRate(preset, input.targetItemName);

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
