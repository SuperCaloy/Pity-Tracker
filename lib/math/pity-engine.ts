import { CalculationResult } from '../../types/pity';
import { getRate } from './rate-model';

export interface PityEngineInput {
  baseRate: number;
  /** Number of pulls the user plans to do FROM NOW (does not include pityOffset) */
  pullsInput: number;
  softPityStart?: number;
  rampRate?: number;
  hardPity?: number;
  pityOffset?: number;
  guarantee?: boolean;
  winRate?: number;
  has50_50?: boolean;
  resetsCounterOnGuarantee?: boolean;
  empiricalRateTable?: number[];
  modelKind?: 'bernoulli' | 'counter';
  guaranteeCost?: number;
  rateUpProb?: number; // Total probability of hitting ANY featured item (e.g. 0.75 for Weapon Banner)
  M?: number;          // Total number of featured items (e.g. 2 for Weapon Banner)
  modelVersion?: string;
}


interface CachedComputation {
  curve: Float64Array;
  pdf: Float64Array;
  thresholds: { p50: number; p80: number; p95: number };
  expectedValue: number;
}

const computeCache = new Map<string, CachedComputation>();

function getCacheKey(input: PityEngineInput): string {
  return [
    input.baseRate,
    input.softPityStart,
    input.rampRate,
    input.hardPity,
    input.pityOffset || 0,
    input.guarantee || false,
    input.winRate ?? 0.5,
    input.has50_50 ?? true,
    input.resetsCounterOnGuarantee ?? true,
    input.empiricalRateTable ? input.empiricalRateTable.join(',') : '',
    input.modelKind || 'bernoulli',
    input.guaranteeCost || 0,
    input.rateUpProb || 0,
    input.M || 0,
    input.modelVersion || 'v1'
  ].join('|');
}

export function calculatePity({
  baseRate,
  pullsInput,
  softPityStart,
  rampRate,
  hardPity,
  pityOffset = 0,
  guarantee = false,
  winRate = 0.5,
  has50_50 = true,
  resetsCounterOnGuarantee = true,
  empiricalRateTable,
  modelKind = 'bernoulli',
  guaranteeCost = 0,
  rateUpProb,
  M
}: PityEngineInput): CalculationResult {
  // Input validation
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

  if (modelKind === 'counter') {
    return {
      curve: [],
      currentP: 0,
      thresholds: { p50: guaranteeCost, p80: guaranteeCost, p95: guaranteeCost },
      expectedValue: guaranteeCost,
      pdf: [],
      modelKind,
      guaranteeCost: {
        pullsToGuarantee: guaranteeCost,
        evCost: guaranteeCost,
        currencyNote: "Obtained via pity counter/mileage"
      }
    };
  }

  const cacheKey = getCacheKey({ baseRate, pullsInput: 0, softPityStart, rampRate, hardPity, pityOffset, guarantee, winRate, has50_50, resetsCounterOnGuarantee, empiricalRateTable, modelKind, guaranteeCost, rateUpProb, M });
  let cached = computeCache.get(cacheKey);

  if (!cached) {
    // f0: PDF of getting a 5-star from 0 pity
    const f0 = new Float64Array(N + 1);
    let logS0 = 0;
    for (let k = 1; k <= N; k++) {
      const r = getRate(k, baseRate, softPityStart, rampRate, hardPity, empiricalRateTable);
      f0[k] = Math.exp(logS0) * r;
      logS0 += r === 1 ? -Infinity : Math.log(1 - r);
      if (logS0 === -Infinity) break;
    }

    // f1: PDF of getting first 5-star from offset
    const f1 = new Float64Array(maxFirstPulls + 1);
    let logS1 = 0;
    for (let i = 1; i <= maxFirstPulls; i++) {
      const k = i + pityOffset;
      const r = getRate(k, baseRate, softPityStart, rampRate, hardPity, empiricalRateTable);
      f1[i] = Math.exp(logS1) * r;
      logS1 += r === 1 ? -Infinity : Math.log(1 - r);
      if (logS1 === -Infinity) break;
    }

    const pdf = new Float64Array(maxTotalPulls + 1);
    let totalMass = 0;
    
    if (guarantee || !has50_50 || (winRate === 1 && !rateUpProb)) { 
      for (let i = 1; i <= maxFirstPulls; i++) {
        pdf[i] = (rateUpProb && M ? (1 / M) : winRate) * f1[i];
        totalMass += pdf[i];
      }
    } else {
      const pFirst = rateUpProb && M ? (rateUpProb / M) : winRate;
      const pGuar = M ? (1 / M) : 1.0;
      const loseProb = rateUpProb ? (1 - rateUpProb) : (1 - winRate);

      for (let n = 1; n <= maxTotalPulls; n++) {
        let prob = 0;
        if (n <= maxFirstPulls) {
          prob += pFirst * f1[n];
        }
        if (n > 1) {
          let conv = 0;
          for (let i = 1; i <= Math.min(n - 1, maxFirstPulls); i++) {
            if ((n - i) <= N) {
              conv += f1[i] * f0[n - i];
            }
          }
          prob += loseProb * pGuar * conv;
        }
        pdf[n] = prob;
        totalMass += prob;
      }
    }

    if (totalMass <= 0) {
      cached = {
        curve: new Float64Array(maxTotalPulls + 1),
        thresholds: { p50: -1, p80: -1, p95: -1 },
        expectedValue: 0,
        pdf: new Float64Array(maxTotalPulls + 1)
      };
    } else {
      for (let i = 1; i <= maxTotalPulls; i++) {
        pdf[i] = (pdf[i] || 0) / totalMass;
      }

      const curve = new Float64Array(maxTotalPulls + 1);
      let cumulative = 0;
      let expectedValue = 0;
      let p50 = Infinity;
      let p80 = Infinity;
      let p95 = Infinity;
      let massConverged = false;

      for (let i = 1; i <= maxTotalPulls; i++) {
        const p = pdf[i];
        expectedValue += i * p;
        cumulative += p;
        
        const finalP = cumulative > 1 ? 1 : cumulative;
        curve[i] = finalP;

        if (p50 === Infinity && finalP >= 0.5) p50 = i;
        if (p80 === Infinity && finalP >= 0.8) p80 = i;
        if (p95 === Infinity && finalP >= 0.95) p95 = i;
        
        if (finalP >= 1 - 1e-12) {
          massConverged = true;
          // Pad the rest of the array with 1s
          for (let j = i + 1; j <= maxTotalPulls; j++) {
            curve[j] = 1;
          }
          break;
        }
      }
      
      if (!massConverged) {
        const lastVal = curve[maxTotalPulls] || 0; // it should be populated up to maxTotalPulls
      }

      cached = {
        curve,
        pdf,
        expectedValue,
        thresholds: { 
          p50: p50 === Infinity ? -1 : p50, 
          p80: p80 === Infinity ? -1 : p80, 
          p95: p95 === Infinity ? -1 : p95 
        }
      };
    }
    computeCache.set(cacheKey, cached);
  }

  const currentP = pullsInput < cached.curve.length ? cached.curve[pullsInput] : (cached.curve[cached.curve.length - 1] || 0);

  return {
    curve: Array.from(cached.curve),
    currentP,
    thresholds: { ...cached.thresholds },
    expectedValue: cached.expectedValue,
    pdf: Array.from(cached.pdf),
    modelKind,
    ...(guaranteeCost > 0 && {
      guaranteeCost: {
        pullsToGuarantee: guaranteeCost,
        evCost: guaranteeCost,
        currencyNote: "Obtained via pity counter/mileage"
      }
    })
  };
}