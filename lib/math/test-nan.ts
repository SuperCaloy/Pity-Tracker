import { calculatePity } from './pity-engine';
import { PRESETS } from '../config/presets';

const preset = PRESETS.find(p => p.id === 'genshin');
const res = calculatePity({
  ...preset.curve,
  pullsInput: 180,
  winRate: 0.5,
  has50_50: preset.curve.has50_50
});

console.log('EV:', res.expectedValue);
