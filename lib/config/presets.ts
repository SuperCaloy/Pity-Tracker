// lib/config/presets.ts — static, versioned in git, no DB
export interface PityCurve {
  baseRate: number;        // flat rate before soft pity begins, e.g. 0.006
  softPityStart?: number;  // pull # where rate begins ramping, e.g. 74
  hardPity: number;        // pull # of guaranteed success, e.g. 90
  rampRate?: number;       // rate increase per pull during soft pity, e.g. 0.06
  hasFiftyFifty?: boolean;
}

export interface GamePreset {
  id: string;
  title: string;           // "Genshin Impact — Character Event"
  curve: PityCurve;
}

export const PRESETS: GamePreset[] = [];