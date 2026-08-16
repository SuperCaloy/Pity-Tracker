import { PityEngineInput } from './pity-engine';

export function simulatePulls(
  { baseRate, softPityStart, rampRate, hardPity }: Omit<PityEngineInput, 'pullsInput'>,
  iterations: number = 1000
): number[] {
  if (baseRate <= 0 || baseRate >= 1) return [];

  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let pullCount = 0;
    while (true) {
      pullCount++;
      let rate = baseRate;
      
      if (hardPity && pullCount >= hardPity) {
        rate = 1;
      } else if (softPityStart && rampRate && pullCount >= softPityStart) {
        rate = Math.min(1, baseRate + (pullCount - softPityStart + 1) * rampRate);
      }

      if (Math.random() < rate) {
        results.push(pullCount);
        break;
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