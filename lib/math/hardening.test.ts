import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PRESETS } from '../config/presets';

describe('CI Hardening (Sprint 5)', () => {
  it('fails if any preset has maxTotalPulls > 660 (Web Worker Guard)', () => {
    // If N > 330, maxTotalPulls > 660, which exceeds the sub-ms threshold for the current engine.
    // If a game requires N > 330, we must implement the Web Worker architecture.
    for (const preset of PRESETS) {
      if (preset.curve.modelKind === 'counter') continue; // Counters do not run the O(N^2) convolution
      
      const hardPity = preset.curve.hardPity || 2000;
      const has50_50 = preset.curve.has50_50 !== false;
      const maxTotalPulls = has50_50 ? hardPity * 2 : hardPity;
      
      expect(
        maxTotalPulls,
        `Preset ${preset.id} requires ${maxTotalPulls} max pulls, exceeding the 660 safe limit. Web Worker required.`
      ).toBeLessThanOrEqual(660);
    }
  });

  it('fails if fixture is older than one game version (Staleness Guard)', () => {
    const fixturePath = path.resolve(__dirname, './fixtures/baseline.json');
    const fixtures: Record<string, any> = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

    const MAX_AGE_DAYS = 45; // Approx one game version
    const now = Date.now();

    for (const [key, fixture] of Object.entries(fixtures)) {
      expect(fixture.lastVerified, `Fixture ${key} is missing lastVerified date`).toBeDefined();
      
      const verifiedDate = new Date(fixture.lastVerified).getTime();
      const ageDays = (now - verifiedDate) / (1000 * 60 * 60 * 24);
      
      expect(
        ageDays,
        `Fixture ${key} is stale (${ageDays.toFixed(1)} days old). Max allowed is ${MAX_AGE_DAYS} days.`
      ).toBeLessThanOrEqual(MAX_AGE_DAYS);
    }
  });
});
