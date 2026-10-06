export function getRate(
  k: number, 
  baseRate: number, 
  softPityStart?: number, 
  rampRate?: number, 
  hardPity?: number,
  empiricalRateTable?: number[]
): number {
  if (hardPity && k >= hardPity) return 1;
  
  if (empiricalRateTable && k > 0 && k <= empiricalRateTable.length) {
    return empiricalRateTable[k - 1]; // k is 1-indexed (pull 1 = index 0)
  }

  if (softPityStart && rampRate && k >= softPityStart) {
    return Math.min(1, baseRate + (k - softPityStart + 1) * rampRate);
  }
  return baseRate;
}
