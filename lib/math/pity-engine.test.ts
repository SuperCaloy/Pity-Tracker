import { describe, it, expect } from 'vitest';
import { calculatePity } from './pity-engine';
  describe('calculatePity', () => {
    it('row 1: baseRate = 0', () => {
      const result = calculatePity({
        baseRate: 0,
        pullsInput: 10,
      });
      expect(result.curve.length).toBe(11); // index 0 is 0 pulls, index 1..10
      expect(result.curve[10]).toBe(0);
      expect(result.thresholds.p50).toBe(Infinity);
      expect(result.thresholds.p80).toBe(Infinity);
      expect(result.thresholds.p95).toBe(Infinity);
    });

    it('row 2: baseRate = 1 (100%)', () => {
      const result = calculatePity({
        baseRate: 1,
        pullsInput: 10,
      });
      expect(result.curve[1]).toBe(1);
      expect(result.currentP).toBe(1);
      expect(result.thresholds.p50).toBe(1);
      expect(result.thresholds.p80).toBe(1);
      expect(result.thresholds.p95).toBe(1);
    });

    it('row 3: invalid rates return empty/sentinel', () => {
      const result1 = calculatePity({ baseRate: -0.1, pullsInput: 10 });
      expect(result1.curve.length).toBe(0);
      
      const result2 = calculatePity({ baseRate: 1.5, pullsInput: 10 });
      expect(result2.curve.length).toBe(0);
    });

    it('row 4: pullsInput = 0', () => {
      const result = calculatePity({ baseRate: 0.05, pullsInput: 0 });
      expect(result.curve.length).toBe(1);
      expect(result.curve[0]).toBe(0);
      expect(result.currentP).toBe(0);
    });

    it('row 5: pullsInput negative', () => {
      const result = calculatePity({ baseRate: 0.05, pullsInput: -5 });
      expect(result.curve.length).toBe(0);
      expect(result.currentP).toBe(0);
    });

    it('row 6: pullsInput extremely large (cap at 2000)', () => {
      const result = calculatePity({ baseRate: 0.01, pullsInput: 100000 });
      expect(result.curve.length).toBe(2001); // 0 + 2000
    });

    it('soft pity integration', () => {
      const result = calculatePity({
        baseRate: 0.006,
        pullsInput: 90,
        softPityStart: 74,
        rampRate: 0.06,
        hardPity: 90
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
      const result = calculatePity({ baseRate: 0.02, pullsInput: 10 });
      expect(result.expectedValue).toBeCloseTo(1 / 0.02, 2);
    });

    it('expected value calculation with soft pity', () => {
      const result = calculatePity({
        baseRate: 0.006,
        pullsInput: 90,
        softPityStart: 74,
        rampRate: 0.06,
        hardPity: 90
      });
      // Genshin EV is typically around ~62.5
      expect(result.expectedValue).toBeGreaterThan(60);
      expect(result.expectedValue).toBeLessThan(65);
    });
  });
