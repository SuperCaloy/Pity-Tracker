// lib/math/pity-engine.ts - pure functions, deterministic, no side effects
import { CalculationResult } from '../../types/pity';

export function getCumulativeCurve(p: number, n: number): number[] {
  // TODO: implement piecewise probability engine
  return [];
}

export function getThresholds(p: number): { p50: number; p80: number; p95: number } {
  // TODO: implement threshold lookup (linear scan)
  return { p50: 0, p80: 0, p95: 0 };
}

export function getExactAttemptPMF(p: number, k: number): number {
  // TODO: implement PMF (optional, for tooltip)
  return 0;
}