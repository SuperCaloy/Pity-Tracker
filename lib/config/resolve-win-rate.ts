import { GamePreset } from './presets';

export function resolveWinRate(preset: GamePreset, targetItemName?: string): number {
  const fallback = preset.curve.winRate ?? 0.5;
  if (!targetItemName || preset.curve.baseRate <= 0) return fallback;
  const targetItem = preset.activeBanner?.featured?.find(f => f.name === targetItemName);
  if (!targetItem || !targetItem.rate) return fallback;
  return Math.min(1, targetItem.rate / preset.curve.baseRate);
}
