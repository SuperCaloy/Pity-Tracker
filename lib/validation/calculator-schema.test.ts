import { describe, it, expect } from 'vitest';
import { validateCalculationInput } from './calculator-schema';
import type { CalculationInput } from '../../types/pity';

describe('validateCalculationInput', () => {
  it('accepts valid minimal input', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 90 });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value).toEqual({ presetId: 'genshin', pullsInput: 90 });
  });

  it('accepts valid maximal input with every optional field', () => {
    const input: CalculationInput = {
      presetId: 'genshin',
      pullsInput: 2000,
      pityOffset: 89,
      guarantee: false,
      targetItemName: 'Odette (New)',
    };
    const result = validateCalculationInput(input);
    expect(result.ok).toBe(true);
    expect(result.value).toEqual(input);
  });

  it('accepts pullsInput at lower bound 0', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 0 });
    expect(result.ok).toBe(true);
  });

  it('accepts pullsInput at upper bound 2000', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 2000 });
    expect(result.ok).toBe(true);
  });

  it('rejects pullsInput 2001', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 2001 });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Pulls must be an integer between 0 and 2000');
  });

  it('rejects pullsInput -1', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: -1 });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Pulls must be an integer between 0 and 2000');
  });

  it('rejects non-integer pullsInput 10.5', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 10.5 });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Pulls must be an integer between 0 and 2000');
  });

  it('accepts pityOffset 89 for genshin (hardPity 90)', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 90, pityOffset: 89 });
    expect(result.ok).toBe(true);
  });

  it('rejects pityOffset 90 for genshin with message mentioning 90', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 1, pityOffset: 90 });
    expect(result.ok).toBe(false);
    const message = result.errors.find((e) => e.includes('90'));
    expect(message).toBeDefined();
    expect(message).toMatch(/Current pity/);
  });

  it('rejects non-integer negative pityOffset', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 1, pityOffset: -5 });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.startsWith('Current pity'))).toBe(true);
  });

  it('validates pityOffset against the selected preset hardPity (fgo 300 < 330 passes)', () => {
    const result = validateCalculationInput({ presetId: 'fgo', pullsInput: 10, pityOffset: 300 });
    expect(result.ok).toBe(true);
  });

  it('validates pityOffset against the selected preset hardPity (genshin 300 >= 90 fails)', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 10, pityOffset: 300 });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.startsWith('Current pity'))).toBe(true);
  });

  it('rejects unknown preset id', () => {
    const result = validateCalculationInput({ presetId: 'nope', pullsInput: 10 });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Unknown preset');
  });

  it('rejects non-string presetId', () => {
    const result = validateCalculationInput({ presetId: 42 as unknown as string, pullsInput: 10 });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Unknown preset');
  });

  it('rejects empty-string presetId', () => {
    const result = validateCalculationInput({ presetId: '', pullsInput: 10 });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Unknown preset');
  });

  it("rejects non-boolean guarantee", () => {
    const result = validateCalculationInput({
      presetId: 'genshin',
      pullsInput: 10,
      guarantee: 'yes' as unknown as boolean,
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Guarantee must be true or false');
  });

  it('rejects empty targetItemName', () => {
    const result = validateCalculationInput({ presetId: 'genshin', pullsInput: 10, targetItemName: '' });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Target item name must be a non-empty string');
  });

  it('accumulates multiple violations instead of short-circuiting', () => {
    const result = validateCalculationInput({ presetId: 'nope', pullsInput: -1 });
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors).toContain('Unknown preset');
    expect(result.errors).toContain('Pulls must be an integer between 0 and 2000');
  });
});
