import { PityEngineInput } from './pity-engine';

export function simulatePulls(
  { baseRate, softPityStart, rampRate, hardPity, winRate = 0.5, has50_50 = true, resetsCounterOnGuarantee = true, guarantee = false }: Omit<PityEngineInput, 'pullsInput'>,
  iterations: number = 1000
): number[] {
  if (baseRate <= 0 || baseRate > 1) return [];

  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let pullCount = 0;
    let pityCounter = 0;
    let hasGuarantee = guarantee;

    while (true) {
      pullCount++;
      pityCounter++;
      let rate = baseRate;
      
      if (hardPity && pityCounter >= hardPity) {
        rate = 1;
      } else if (softPityStart && rampRate && pityCounter >= softPityStart) {
        rate = Math.min(1, baseRate + (pityCounter - softPityStart + 1) * rampRate);
      }

      if (Math.random() < rate) {
        const isFeatured = (!has50_50) 
            ? (Math.random() < winRate) 
            : (hasGuarantee || Math.random() < winRate);

        if (isFeatured) {
          results.push(pullCount);
          break;
        } else {
          if (has50_50) hasGuarantee = true;
          if (resetsCounterOnGuarantee) pityCounter = 0;
        }
      }
      
      // Safety break to prevent infinite loops on tiny rates
      if (pullCount > 50000) {
        results.push(pullCount);
        break;
      }
    }
  }

  // Sort ascending for easier threshold/median extraction by consumers
  return results.sort((a, b) => a - b);
}