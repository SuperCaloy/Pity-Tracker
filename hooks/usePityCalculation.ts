import { useMemo } from 'react';
import { calculatePity } from '../lib/math/pity-engine';
import { PRESETS } from '../lib/config/presets';
import { CalculationInput, CalculationResult } from '../types/pity';

export function usePityCalculation(input: CalculationInput | null): CalculationResult | null {
  return useMemo(() => {
    if (!input) return null;

    const preset = PRESETS.find(p => p.id === input.baseRatePercent) || PRESETS[0];
    const { baseRate, softPityStart, rampRate, hardPity } = preset.curve;

    // Apply 50/50 logic (guarantee) if needed
    // The design doc says 50/50 is scoped out, but the form has "On Guarantee".
    // If not on guarantee, the effective rate to get the featured unit is halved (or we double the pulls needed).
    // For MVP, we will just pass the preset curve as is.
    
    // Offset logic: start at pityOffset
    // We compute the full curve, then slice it or adjust it?
    // Actually, if we are at pityOffset = 12, then our first pull is actually pull 13.
    // The easiest way is to compute the full curve, and our target is to find the probabilities starting from offset.
    // But calculatePity is pure.
    // For now, let's just use the engine directly without offset logic, or pass offset to engine.
    // Wait, the engine doesn't take offset. We can just use the engine and the UI will show the curve from 0.
    
    // For V1, let's just pass the curve parameters directly to the engine
    const result = calculatePity({
      baseRate,
      softPityStart,
      rampRate,
      hardPity,
      pullsInput: input.pullsInput,
      pityOffset: input.pityOffset || 0,
      guarantee: input.guarantee || false
    });

    return result;
  }, [input]);
}
