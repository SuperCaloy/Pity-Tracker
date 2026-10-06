import * as fs from 'fs';
import * as path from 'path';

let content = fs.readFileSync(path.resolve('./lib/config/presets.ts'), 'utf-8');

function updatePricing(id: string, pulls: number, price: number, pullCost: number) {
  // Regex to match the pricing line for a specific game id
  const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?pricing:\\s*{[^}]*?pullsPerPack:\\s*)[0-9.]+([^}]*?costPerPull:\\s*)[0-9.]+([^}]*?packPrice:\\s*)[0-9.]+([^}]*?})`, 'm');
  // It's easier to just replace the whole pricing object.
  const pricingRegex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?pricing:\\s*{)[^}]+(})`);
  content = content.replace(pricingRegex, `$1 currency: "PHP", packPrice: ${price}, pullsPerPack: ${pulls}, costPerPull: ${pullCost}, pricingDisclaimer: "Based on official PHP pricing." $2`);
}

updatePricing('genshin', 50.5, 4990, 98.81);
updatePricing('genshin_weapon', 50.5, 4990, 98.81);
updatePricing('hsr', 50.5, 4990, 98.81);
updatePricing('zzz', 50.5, 4990, 98.81);
updatePricing('wuwa', 50.5, 4990, 98.81);
updatePricing('arknights_endfield', 50.5, 4990, 98.81);
updatePricing('bluearchive', 55, 3990, 72.55);
updatePricing('nikke', 25, 4990, 199.60);
updatePricing('fgo', 55.6, 3990, 71.76);
updatePricing('epicseven', 40, 4990, 124.75);
updatePricing('sla', 40, 4990, 124.75);

// Fix Genshin Banner (1 char)
content = content.replace(
  /name: "Version 5.0 Phase 1 \(Aug 12 - Sep 1, 2026\)"[\s\S]*?featured: \[[^\]]*\]/m,
  `name: "Version 5.0 Phase 1 (Aug 12 - Sep 1, 2026)",
      featured: [
        { name: "Mualani", rate: 0.003 }
      ]`
);

// Fix HSR Banner (1 char)
content = content.replace(
  /name: "Version 4.5 Phase 1 \(Aug 25 - Sep 16, 2026\)"[\s\S]*?featured: \[[^\]]*\]/m,
  `name: "Version 4.5 Phase 1 (Aug 25 - Sep 16, 2026)",
      featured: [
        { name: "Robin (Summeretto)", rate: 0.003 }
      ]`
);

// Fix ZZZ Banner (1 char)
content = content.replace(
  /name: "Version 3.1 Phase 2 \(Until Sep 8, 2026\)"[\s\S]*?featured: \[[^\]]*\]/m,
  `name: "Version 3.1 Phase 2 (Until Sep 8, 2026)",
      featured: [
        { name: "Jane Doe", rate: 0.003 }
      ]`
);

// Fix WuWa Banner (1 char)
content = content.replace(
  /name: "Version 3.6 Phase 1 \(Aug 20 - Oct 1, 2026\)"[\s\S]*?featured: \[[^\]]*\]/m,
  `name: "Version 3.6 Phase 1 (Aug 20 - Oct 1, 2026)",
      featured: [
        { name: "Zhezhi", rate: 0.004 }
      ]`
);

// Fix Blue Archive Banner (1 char, 0.007)
content = content.replace(
  /name: "Global Banner \(Aug 18 - Sep 1, 2026\)"[\s\S]*?featured: \[[^\]]*\]/m,
  `name: "Global Banner (Aug 18 - Sep 1, 2026)",
      featured: [
        { name: "Dress Hina", rate: 0.007 }
      ]`
);

// Fix NIKKE Banner (1 char, 0.02)
content = content.replace(
  /name: "Persona Collab \(From Aug 13, 2026\)"[\s\S]*?featured: \[[^\]]*\]/m,
  `name: "Evangelion Collab (From Aug 22, 2026)",
      featured: [
        { name: "Asuka", rate: 0.02 }
      ]`
);

// Fix Epic Seven Banner (1 char, 0.01)
content = content.replace(
  /name: "Secret Summer \(Jun 25 - Aug 26, 2026\)"[\s\S]*?featured: \[[^\]]*\]/m,
  `name: "Secret Summer (Jun 25 - Aug 26, 2026)",
      featured: [
        { name: "Fumyr", rate: 0.01 }
      ]`
);

fs.writeFileSync(path.resolve('./lib/config/presets.ts'), content, 'utf-8');
console.log('Fixed pricing and banners!');
