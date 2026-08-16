export interface PityCurve {
  baseRate: number;        // flat rate before soft pity begins, e.g. 0.006
  softPityStart?: number;  // pull # where rate begins ramping, e.g. 74
  hardPity: number;        // pull # of guaranteed success, e.g. 90
  rampRate?: number;       // rate increase per pull during soft pity, e.g. 0.06
}

export interface GamePreset {
  id: string;
  title: string;
  curve: PityCurve;
}

export const PRESETS: GamePreset[] = [
  {
    id: "genshin",
    title: "Genshin Impact / HSR — Character Event",
    curve: { baseRate: 0.006, softPityStart: 74, hardPity: 90, rampRate: 0.06 },
  },
  {
    id: "arknights",
    title: "Arknights — Standard Banner",
    curve: { baseRate: 0.02, softPityStart: 51, hardPity: 300, rampRate: 0.02 },
  },
  {
    id: "fgo",
    title: "Fate/Grand Order",
    curve: { baseRate: 0.01, hardPity: 330 }, 
  },
];