import { CalculationResult } from '../../types/pity';

export interface PityEngineInput {
  baseRate: number;
  pullsInput: number;
  softPityStart?: number;
  rampRate?: number;
  hardPity?: number;
  pityOffset?: number;
  guarantee?: boolean;
  winRate?: number;
}

function getRate(k: number, baseRate: number, softPityStart?: number, rampRate?: number, hardPity?: number): number {
  if (hardPity && k >= hardPity) return 1;
  if (softPityStart && rampRate && k >= softPityStart) {
    return Math.min(1, baseRate + (k - softPityStart + 1) * rampRate);
  }
  return baseRate;
}

export function calculatePity({
  baseRate,
  pullsInput,
  softPityStart,
  rampRate,
  hardPity,
  pityOffset = 0,
  guarantee = false,
  winRate = 0.5
}: PityEngineInput): CalculationResult {
  // Input validation
  if (baseRate < 0 || baseRate > 1 || pullsInput < 0) {
    return {
      curve: [],
      currentP: 0,
      thresholds: { p50: Infinity, p80: Infinity, p95: Infinity },
      expectedValue: 0,
      pdf: []
    };
  }

  const N = hardPity || 2000;
  
  // f0: PDF of getting a 5-star from 0 pity
  const f0: number[] = new Array(N + 1).fill(0);
  let S0 = 1;
  for (let k = 1; k <= N; k++) {
    const r = getRate(k, baseRate, softPityStart, rampRate, hardPity);
    f0[k] = S0 * r;
    S0 *= (1 - r);
    if (S0 <= 0) break;
  }

  // f1: PDF of getting first 5-star from offset
  const maxFirstPulls = Math.max(1, N - pityOffset);
  const f1: number[] = new Array(maxFirstPulls + 1).fill(0);
  let S1 = 1;
  for (let i = 1; i <= maxFirstPulls; i++) {
    const k = i + pityOffset;
    const r = getRate(k, baseRate, softPityStart, rampRate, hardPity);
    f1[i] = S1 * r;
    S1 *= (1 - r);
    if (S1 <= 0) break;
  }

  // Total PDF for getting the featured character
  const maxTotalPulls = Math.max(1, (guarantee || winRate === 1) ? maxFirstPulls : maxFirstPulls + N);
  const pdf: number[] = new Array(maxTotalPulls + 1).fill(0);
  
  if (guarantee || baseRate === 1 || winRate === 1) { // If winRate is 1, you always win the character
    for (let i = 1; i <= maxFirstPulls; i++) {
      pdf[i] = f1[i];
    }
  } else {
    for (let n = 1; n <= maxTotalPulls; n++) {
      let prob = 0;
      // Win 50/50 (or custom winRate) on the first 5-star
      if (n <= maxFirstPulls) {
        prob += winRate * f1[n];
      }
      // Lose 50/50 on first 5-star (at pull i), then win guarantee on second 5-star (at pull n - i)
      for (let i = 1; i < n; i++) {
        if (i <= maxFirstPulls && (n - i) <= N) {
          prob += (1 - winRate) * f1[i] * f0[n - i];
        }
      }
      pdf[n] = prob;
    }
  }

  const curve: number[] = [0]; // CDF
  let cumulative = 0;
  let expectedValue = 0;
  let p50 = Infinity;
  let p80 = Infinity;
  let p95 = Infinity;

  // We want to render up to at least hardPity (or 2x hardPity if 50/50)
  for (let i = 1; i <= maxTotalPulls; i++) {
    const p = pdf[i] || 0;
    expectedValue += i * p;
    cumulative += p;
    
    // Fix floating point errors
    const finalP = cumulative > 0.9999999999 ? 1 : cumulative;
    curve.push(finalP);

    if (p50 === Infinity && finalP >= 0.5) p50 = i;
    if (p80 === Infinity && finalP >= 0.8) p80 = i;
    if (p95 === Infinity && finalP >= 0.95) p95 = i;
    
    if (finalP >= 1) {
      // Pad out a few more zero-probability entries if needed for smoothness at the very end
      break;
    }
  }
  
  // Ensure the curve reaches 100% at the end if it broke early
  while (curve.length <= maxTotalPulls) {
      curve.push(1);
  }

  const currentP = pullsInput < curve.length ? curve[pullsInput] : (curve[curve.length - 1] || 0);

  return {
    curve,
    currentP,
    thresholds: { p50, p80, p95 },
    expectedValue,
    pdf
  };
}