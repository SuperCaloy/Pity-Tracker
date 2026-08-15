// types/pity.ts - Shared TS types (CalculationInput, CalculationResult)

export interface CalculationInput {
  baseRatePercent: string;
  pullsInput: number;
  pityCap?: number;
  pityOffset?: number; // from "already at pity"
}

export interface CalculationResult {
  curve: number[];              // cumulative probability, index = pull number
  currentP: number;             // cumulative probability at pullsInput
  thresholds: { p50: number; p80: number; p95: number };
  expectedValue: number;        // 1/effectiveRate, or curve-derived for soft pity
  monteCarloSpread?: number[];  // 1000 sampled first-success pull numbers, only if toggled
}