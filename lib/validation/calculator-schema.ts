import type { CalculationInput } from '../../types/pity';
import { PRESETS } from '../config/presets';

export interface ValidationResult {
  ok: boolean;
  value?: CalculationInput;
  errors: string[];
}

export function validateCalculationInput(input: CalculationInput): ValidationResult {
  const errors: string[] = [];

  const preset =
    typeof input.presetId === 'string' && input.presetId.length > 0
      ? PRESETS.find((p) => p.id === input.presetId)
      : undefined;

  if (!preset) {
    errors.push('Unknown preset');
  }

  if (!Number.isInteger(input.pullsInput) || input.pullsInput < 0 || input.pullsInput > 2000) {
    errors.push('Pulls must be an integer between 0 and 2000');
  }

  if (preset && input.pityOffset !== undefined) {
    const valid =
      Number.isInteger(input.pityOffset) &&
      input.pityOffset >= 0 &&
      input.pityOffset < preset.curve.hardPity;
    if (!valid) {
      errors.push(`Current pity must be an integer below hard pity (<${preset.curve.hardPity}>`);
    }
  }

  if (input.guarantee !== undefined && typeof input.guarantee !== 'boolean') {
    errors.push('Guarantee must be true or false');
  }

  if (
    input.targetItemName !== undefined &&
    !(typeof input.targetItemName === 'string' && input.targetItemName.length > 0)
  ) {
    errors.push('Target item name must be a non-empty string');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: input, errors: [] };
}
