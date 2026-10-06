import { CalculationResult } from '../../types/pity';
import { PityEngineInput } from './pity-engine';
import { getRate } from './rate-model';

export function calculatePityMarkov(input: PityEngineInput): CalculationResult {
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
  const TOTAL_STATES = 2 * N + 1;
  const TARGET_STATE = 2 * N;

  // Build the Time-Homogeneous Transition Matrix in a sparse way
  // transitions[fromState] = Array of { toState, prob }
  const transitions: Array<Array<{ to: number; prob: number }>> = Array.from({ length: TOTAL_STATES }, () => []);

  for (let p = 0; p < N; p++) {
    const rate = getRate(p + 1, baseRate, softPityStart, rampRate, hardPity);
    const pWin = rate;
    const pLose = 1 - rate;

    const state0 = p;
    const state1 = N + p;

    // State 0 (No 5-star yet)
    // 1. Didn't get 5-star -> pity goes up
    if (pLose > 0) transitions[state0].push({ to: Math.min(p + 1, N - 1), prob: pLose });
    
    // 2. Got 5-star
    if (pWin > 0) {
      if (!has50_50 || winRate === 1) {
        transitions[state0].push({ to: TARGET_STATE, prob: pWin });
      } else {
        // Win 50/50 -> TARGET
        transitions[state0].push({ to: TARGET_STATE, prob: pWin * winRate });
        // Lose 50/50 -> State 1 (pity 0)
        transitions[state0].push({ to: N + 0, prob: pWin * (1 - winRate) });
      }
    }

    // State 1 (Lost 50/50, on guarantee)
    // 1. Didn't get 5-star -> pity goes up
    if (pLose > 0) transitions[state1].push({ to: N + Math.min(p + 1, N - 1), prob: pLose });
    
    // 2. Got 5-star -> Guaranteed TARGET
    if (pWin > 0) transitions[state1].push({ to: TARGET_STATE, prob: pWin });
  }

  // Absorbing state stays in absorbing state
  transitions[TARGET_STATE].push({ to: TARGET_STATE, prob: 1.0 });

  // Vector of state probabilities
  let v = new Float64Array(TOTAL_STATES);
  if (guarantee) {
    v[N + pityOffset] = 1.0;
  } else {
    v[pityOffset] = 1.0;
  }

  const pdf = new Float64Array(maxTotalPulls + 1);
  let previousTargetProb = 0;
  let expectedValue = 0;

  // Multiply vector by transition matrix `maxTotalPulls` times
  for (let k = 1; k <= maxTotalPulls; k++) {
    const nextV = new Float64Array(TOTAL_STATES);
    
    // Sparse vector-matrix multiplication
    for (let i = 0; i < TOTAL_STATES; i++) {
      if (v[i] > 0) {
        const trans = transitions[i];
        for (let j = 0; j < trans.length; j++) {
          nextV[trans[j].to] += v[i] * trans[j].prob;
        }
      }
    }
    
    v = nextV;
    
    // The PDF at step k is the probability that we ENTERED the TARGET_STATE at step k.
    // Which is the total probability in TARGET_STATE minus what was already there in step k-1.
    const currentTargetProb = v[TARGET_STATE];
    const newArrivals = currentTargetProb - previousTargetProb;
    pdf[k] = newArrivals > 0 ? newArrivals : 0;
    previousTargetProb = currentTargetProb;
  }

  // Normalize and calculate CDF
  let totalMass = 0;
  for (let i = 1; i <= maxTotalPulls; i++) {
    totalMass += pdf[i] || 0;
  }

  const curve = new Float64Array(maxTotalPulls + 1);
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
