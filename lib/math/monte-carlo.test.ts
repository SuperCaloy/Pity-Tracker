import { describe, it, expect } from 'vitest';
import { calculatePity } from './pity-engine';
import { simulatePulls } from './monte-carlo';

describe('Monte Carlo Oracle (code-correctness only)', () => {
  it('converges to the exact computed PDF within pointwise tolerance', () => {
    // We use a scaled-down 1e5 for general local tests, but 1e6 for CI is ideal. 
    // Here we use 100_000 to keep the test from timing out locally, but it verifies the same logic.
    const N = 100_000;
    const input = {
      baseRate: 0.006,
      softPityStart: 74,
      rampRate: 0.06,
      hardPity: 90,
      winRate: 0.5,
      has50_50: true,
      resetsCounterOnGuarantee: true,
      pullsInput: 0
    };

    const exactResult = calculatePity(input);
    const mcResults = simulatePulls(input, N);

    // Compute MC CDF
    const mcCdf: number[] = new Array(exactResult.curve.length).fill(0);
    for (const pulls of mcResults) {
      if (pulls < mcCdf.length) {
        mcCdf[pulls]++;
      }
    }

    // Cumulative sum
    for (let i = 1; i < mcCdf.length; i++) {
      mcCdf[i] += mcCdf[i - 1];
    }
    
    // Normalize to [0, 1]
    for (let i = 1; i < mcCdf.length; i++) {
      mcCdf[i] /= N;
    }

    // Check pointwise tolerance
    // Plan specifies pointwise tol >= 0.015
    const tol = 0.015;
    
    // Check key percentiles/pulls rather than every single array index to avoid excessive logs on failure,
    // or just find the max deviation.
    let maxDev = 0;
    let maxDevIndex = 0;
    
    for (let i = 1; i < exactResult.curve.length; i++) {
      // mcCdf might be slightly shorter or longer if no pulls went that far, but we pad logic
      const mcVal = mcCdf[i] || mcCdf[mcCdf.length - 1] || 0;
      const exactVal = exactResult.curve[i];
      const dev = Math.abs(mcVal - exactVal);
      if (dev > maxDev) {
        maxDev = dev;
        maxDevIndex = i;
      }
    }
    
    expect(maxDev).toBeLessThanOrEqual(tol);
  });
});
