import { CalculationResult } from '../../types/pity';
import { PityEngineInput } from './pity-engine';
import { getRate } from './rate-model';

export function calculatePityDP(input: PityEngineInput): CalculationResult {
  const {
    baseRate,
    pullsInput,
    softPityStart,
    rampRate,
    hardPity,
    pityOffset = 0,
    guarantee = false,
    winRate = 0.5,
    has50_50 = true,
    empiricalRateTable,
  } = input;

  if (baseRate < 0 || baseRate > 1 || pullsInput < 0) {
    return {
      curve: [],
      currentP: 0,
      thresholds: { p50: -1, p80: -1, p95: -1 },
      expectedValue: 0,
      pdf: []
    };
  }

  const N = hardPity || 2000;
  const maxFirstPulls = Math.max(1, N - pityOffset);
  const maxTotalPulls = Math.max(1, (guarantee || !has50_50 || winRate === 1) ? maxFirstPulls : maxFirstPulls + N);

  const pdf = new Float64Array(maxTotalPulls + 1);
  
  // DP[0][p] = probability of being in state 0 (no 5-star yet) with pity p
  // DP[1][p] = probability of being in state 1 (lost 50/50) with pity p
  let dp0 = new Float64Array(N + 1);
  let dp1 = new Float64Array(N + 1);
  
  // Initial state
  if (guarantee) {
    dp1[pityOffset] = 1.0;
  } else {
    dp0[pityOffset] = 1.0;
  }

  for (let k = 1; k <= maxTotalPulls; k++) {
    const nextDp0 = new Float64Array(N + 1);
    const nextDp1 = new Float64Array(N + 1);
    let massInStep = 0;

    for (let p = 0; p < N; p++) {
      // Process State 0
      if (dp0[p] > 0) {
        const rate = getRate(p + 1, baseRate, softPityStart, rampRate, hardPity);
        const pWin = rate;
        const pLose = 1 - rate;

        // Didn't get 5-star
        nextDp0[p + 1] += dp0[p] * pLose;
        
        // Got 5-star
        if (!has50_50 || winRate === 1) {
          pdf[k] += dp0[p] * pWin;
        } else {
          // Won 50/50
          pdf[k] += dp0[p] * pWin * winRate;
          // Lost 50/50
          nextDp1[0] += dp0[p] * pWin * (1 - winRate);
        }
        massInStep += dp0[p];
      }

      // Process State 1
      if (dp1[p] > 0) {
        const rate = getRate(p + 1, baseRate, softPityStart, rampRate, hardPity);
        const pWin = rate;
        const pLose = 1 - rate;

        // Didn't get 5-star
        nextDp1[p + 1] += dp1[p] * pLose;
        
        // Got 5-star (Guaranteed featured)
        pdf[k] += dp1[p] * pWin;
        massInStep += dp1[p];
      }
    }
    
    dp0 = nextDp0;
    dp1 = nextDp1;

    // Early exit if practically all probability mass is depleted
    if (massInStep < 1e-15) {
      break;
    }
  }

  // Normalize and calculate CDF
  let totalMass = 0;
  for (let i = 1; i <= maxTotalPulls; i++) {
    totalMass += pdf[i] || 0;
  }

  const curve = new Float64Array(maxTotalPulls + 1);
  let expectedValue = 0;
  let thresholds = { p50: -1, p80: -1, p95: -1 };

  if (totalMass > 0) {
    let cumulative = 0;
    let p50 = Infinity;
    let p80 = Infinity;
    let p95 = Infinity;

    for (let i = 1; i <= maxTotalPulls; i++) {
      pdf[i] = (pdf[i] || 0) / totalMass;
      expectedValue += i * pdf[i];
      cumulative += pdf[i];
      
      const finalP = cumulative > 1 ? 1 : cumulative;
      curve[i] = finalP;

      if (p50 === Infinity && finalP >= 0.5) p50 = i;
      if (p80 === Infinity && finalP >= 0.8) p80 = i;
      if (p95 === Infinity && finalP >= 0.95) p95 = i;
      
      if (finalP >= 1 - 1e-12) {
        for (let j = i + 1; j <= maxTotalPulls; j++) {
          curve[j] = 1;
        }
        break;
      }
    }

    thresholds = { 
      p50: p50 === Infinity ? -1 : p50, 
      p80: p80 === Infinity ? -1 : p80, 
      p95: p95 === Infinity ? -1 : p95 
    };
  }

  const currentP = pullsInput < curve.length ? curve[pullsInput] : (curve[curve.length - 1] || 0);

  return {
    curve: Array.from(curve),
    currentP,
    thresholds,
    expectedValue,
    pdf: Array.from(pdf)
  };
}
