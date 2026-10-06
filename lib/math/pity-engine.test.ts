import { describe, it, expect } from 'vitest';
import { calculatePity, PityEngineInput } from './pity-engine';
import { calculatePityDP } from './dp-engine';
import { calculatePityMarkov } from './markov-engine';

describe('calculatePity', () => {
  it('row 1: baseRate = 0', () => {
    const result = calculatePity({
      baseRate: 0,
      pullsInput: 10,
    });
    expect(result.curve.length).toBe(4001); // 2000 * 2 + 1
    expect(result.curve[10]).toBe(0);
    expect(result.thresholds.p50).toBe(-1);
    expect(result.thresholds.p80).toBe(-1);
    expect(result.thresholds.p95).toBe(-1);
  });

  it('row 2: baseRate = 1 (100%)', () => {
    const result = calculatePity({
      baseRate: 1,
      pullsInput: 10,
      winRate: 0.5
    });
    expect(result.curve[1]).toBe(0.5);
    expect(result.curve[2]).toBe(1);
    expect(result.expectedValue).toBeCloseTo(1.5);
    expect(result.thresholds.p50).toBe(1); // 50% at pull 1
    expect(result.thresholds.p80).toBe(2); // 100% at pull 2
    expect(result.thresholds.p95).toBe(2);
  });

  it('row 3: invalid rates return empty/sentinel', () => {
    const result1 = calculatePity({ baseRate: -0.1, pullsInput: 10 });
    expect(result1.curve.length).toBe(0);
    
    const result2 = calculatePity({ baseRate: 1.5, pullsInput: 10 });
    expect(result2.curve.length).toBe(0);
  });

  it('row 4: pullsInput = 0', () => {
    const result = calculatePity({ baseRate: 0.05, pullsInput: 0 });
    expect(result.curve.length).toBe(4001);
    expect(result.curve[0]).toBe(0);
    expect(result.currentP).toBe(0);
  });

  it('row 5: pullsInput negative', () => {
    const result = calculatePity({ baseRate: 0.05, pullsInput: -5 });
    expect(result.curve.length).toBe(0); // input validation catches this
    expect(result.currentP).toBe(0);
  });

  it('row 6: pullsInput extremely large (cap at 2000)', () => {
    const result = calculatePity({ baseRate: 0.01, pullsInput: 100000 });
    expect(result.curve.length).toBe(4001);
  });

  it('soft pity integration', () => {
    const result = calculatePity({
      baseRate: 0.006,
      pullsInput: 90,
      softPityStart: 74,
      rampRate: 0.06,
      hardPity: 90,
      winRate: 1 // Test any 5-star to match previous bounds
    });
    
    // Pull 1-73 rate should be 0.006
    expect(result.curve[73]).toBeCloseTo(1 - Math.pow(1 - 0.006, 73), 4);
    // Pull 90 rate is 1, so cumulative is 1
    expect(result.curve[90]).toBe(1);
    expect(result.currentP).toBe(1);
    expect(result.thresholds.p50).toBeLessThanOrEqual(80);
    expect(result.thresholds.p95).toBeLessThanOrEqual(90);
  });
  
  it('expected value calculation without soft pity', () => {
    const result = calculatePity({ baseRate: 0.02, pullsInput: 10, winRate: 1 });
    expect(result.expectedValue).toBeCloseTo(1 / 0.02, 2);
  });

  it('expected value calculation with soft pity', () => {
    const result = calculatePity({
      baseRate: 0.006,
      pullsInput: 90,
      softPityStart: 74,
      rampRate: 0.06,
      hardPity: 90,
      winRate: 1 // To get EV of any 5-star
    });
    // Genshin EV is typically around ~62.5 for any 5-star
    expect(result.expectedValue).toBeGreaterThan(60);
    expect(result.expectedValue).toBeLessThan(65);
  });

  describe('Performance (Task 1.7 Guard)', () => {
    it('returns cached results in less than 5ms', () => {
      const input: PityEngineInput = {
        baseRate: 0.006,
        softPityStart: 74,
        rampRate: 0.06,
        hardPity: 90,
        pullsInput: 50,
      };

      // Prime cache
      calculatePity(input);

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        calculatePity(input);
      }
      const end = performance.now();
      const avg = (end - start) / 100;
      
      expect(avg).toBeLessThan(5);
    });
  });

  describe('Tri-Core Ensemble Validator', () => {
    const testCases: PityEngineInput[] = [
      { baseRate: 0.006, softPityStart: 74, rampRate: 0.06, hardPity: 90, pullsInput: 180, winRate: 0.5, has50_50: true, guarantee: false }, // Standard Genshin
      { baseRate: 0.006, softPityStart: 74, rampRate: 0.06, hardPity: 90, pullsInput: 180, winRate: 0.5, has50_50: true, guarantee: true },  // Genshin Guarantee
      { baseRate: 0.02, hardPity: 50, pullsInput: 100, winRate: 0.5, has50_50: true, guarantee: false }, // Flat rate to pity
      { baseRate: 0.008, softPityStart: 60, rampRate: 0.08, hardPity: 80, pullsInput: 160, pityOffset: 20, winRate: 0.5, has50_50: true, guarantee: false } // Offset test
    ];

    it('asserts Convolution === DP === Markov exactly', () => {
      for (const input of testCases) {
        const resConv = calculatePity(input);
        const resDP = calculatePityDP(input);
        const resMarkov = calculatePityMarkov(input);

        // Expect matching expected values (EV)
        expect(resConv.expectedValue).toBeCloseTo(resDP.expectedValue, 8);
        expect(resConv.expectedValue).toBeCloseTo(resMarkov.expectedValue, 8);

        // Expect matching thresholds
        expect(resConv.thresholds.p50).toBe(resDP.thresholds.p50);
        expect(resConv.thresholds.p80).toBe(resDP.thresholds.p80);
        expect(resConv.thresholds.p95).toBe(resDP.thresholds.p95);
        expect(resMarkov.thresholds.p50).toBe(resDP.thresholds.p50);

        // Expect identically sized output arrays
        expect(resConv.pdf.length).toBe(resDP.pdf.length);
        expect(resConv.pdf.length).toBe(resMarkov.pdf.length);

        // Expect identical probabilities for every single pull
        for (let i = 1; i < resConv.pdf.length; i++) {
          if (resConv.pdf[i] > 0 || resDP.pdf[i] > 0 || resMarkov.pdf[i] > 0) {
            expect(resDP.pdf[i]).toBeCloseTo(resConv.pdf[i], 8);
            expect(resMarkov.pdf[i]).toBeCloseTo(resConv.pdf[i], 8);
            expect(resDP.curve[i]).toBeCloseTo(resConv.curve[i], 8);
            expect(resMarkov.curve[i]).toBeCloseTo(resConv.curve[i], 8);
          }
        }
      }
    });
  });
});
