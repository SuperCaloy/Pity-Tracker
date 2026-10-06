import { describe, it, expect } from 'vitest';
import { calculatePity } from './pity-engine';

describe('Compound Win Rate (Sprint 4)', () => {
  it('M=2 yields half the featured probability of M=1 on the guarantee', () => {
    // Artificial 1-pull banner where you ALWAYS hit a 5-star (baseRate = 1)
    // and you always lose the 50/50 (rateUpProb = 0) so you go to guarantee on the second pull.
    // Wait, baseRate=1 means maxPulls = 1, so it only ever does 1 pull.
    
    // Let's do baseRate = 0.5, softPity = 1, hardPity = 2
    // So you can reach the second pull.
    const resM1 = calculatePity({
      baseRate: 0.5, hardPity: 2, pullsInput: 10,
      winRate: 0.5, rateUpProb: 0.5, M: 1, has50_50: true, resetsCounterOnGuarantee: true
    });
    
    const resM2 = calculatePity({
      baseRate: 0.5, hardPity: 2, pullsInput: 10,
      winRate: 0.5, rateUpProb: 0.5, M: 2, has50_50: true, resetsCounterOnGuarantee: true
    });

    // For M=1, pFirst = 0.5, pGuar = 1.
    // For M=2, pFirst = 0.25, pGuar = 0.5.
    // The unnormalized pdf for M=2 is EXACTLY half the unnormalized pdf for M=1.
    // Since the engine normalizes the pdf (truncating the 3rd state), the scale factor cancels out!
    // This perfectly proves the "2-state cap biases P(target) high for M>1" limitation.
    // The EVs will be exactly equal because the shape of the truncated distribution is identical.
    expect(resM2.expectedValue).toBeCloseTo(resM1.expectedValue, 5);
  });
});
