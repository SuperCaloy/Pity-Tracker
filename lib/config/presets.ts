export interface FeaturedItem {
  name: string;
  rate: number; 
}

export interface GamePricing {
  currency: string;      
  packPrice: number;     
  pullsPerPack: number;  
  costPerPull: number;
  pricingDisclaimer?: string;
}

export interface PityCurve {
  baseRate: number;        
  softPityStart?: number;  
  hardPity: number;        
  rampRate?: number;       
  winRate?: number;        // e.g. 0.5 for 50/50 systems
  has50_50?: boolean;
  resetsCounterOnGuarantee?: boolean;
  modelKind?: 'bernoulli' | 'counter';
  guaranteeType?: string;
  guaranteeCost?: number;  // e.g. 200 for spark
  empiricalRateTable?: number[]; // Pre-computed array of rates [pull1, pull2, ..., pull90]
  modelVersion?: string;
  rateUpProb?: number;
  M?: number;
}

export interface GamePreset {
  id: string;
  title: string;
  publisher: string;
  curve: PityCurve;
  pricing: GamePricing;
  activeBanner: {
    name: string;
    featured: FeaturedItem[];
  };
}

export const PRESETS: GamePreset[] = [
  {
    id: "genshin",
    title: "Genshin Impact",
    publisher: "HoYoverse",
    curve: { baseRate: 0.006, softPityStart: 74, hardPity: 90, rampRate: 0.06, winRate: 0.5, has50_50: true, resetsCounterOnGuarantee: true, modelKind: 'bernoulli' },
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 50.5, costPerPull: 98.81, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Version 5.0 Phase 1 (Aug 12 - Sep 1, 2026)",
      featured: [
        { name: "Mualani", rate: 0.003 }
      ]
    }
  },
  {
    id: "genshin_weapon",
    title: "Genshin Impact Weapon",
    publisher: "HoYoverse",
    curve: { baseRate: 0.007, softPityStart: 63, hardPity: 80, rampRate: 0.07, winRate: 0.375, rateUpProb: 0.75, M: 2, has50_50: true, resetsCounterOnGuarantee: true, modelKind: 'bernoulli' },
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 50.5, costPerPull: 98.81, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Version 5.0 Phase 1 Weapon",
      featured: [
        { name: "Signature Weapon A", rate: 0.002625 },
        { name: "Signature Weapon B", rate: 0.002625 }
      ]
    }
  },
  {
    id: "hsr",
    title: "Honkai: Star Rail",
    publisher: "HoYoverse",
    curve: { baseRate: 0.006, softPityStart: 74, hardPity: 90, rampRate: 0.06, winRate: 0.5, has50_50: true, resetsCounterOnGuarantee: true, modelKind: 'bernoulli' },
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 50.5, costPerPull: 98.81, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Version 4.5 Phase 1 (Aug 25 - Sep 16, 2026)",
      featured: [
        { name: "Robin (Summeretto)", rate: 0.003 }
      ]
    }
  },
  {
    id: "zzz",
    title: "Zenless Zone Zero",
    publisher: "HoYoverse",
    curve: { baseRate: 0.006, softPityStart: 74, hardPity: 90, rampRate: 0.06, winRate: 0.5, has50_50: true, resetsCounterOnGuarantee: true, modelKind: 'bernoulli' },
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 50.5, costPerPull: 98.81, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Version 3.1 Phase 2 (Until Sep 8, 2026)",
      featured: [
        { name: "Jane Doe", rate: 0.003 }
      ]
    }
  },
  {
    id: "wuwa",
    title: "Wuthering Waves",
    publisher: "Kuro Games",
    curve: { baseRate: 0.008, softPityStart: 66, hardPity: 80, rampRate: 0.0469, winRate: 0.5, has50_50: true, resetsCounterOnGuarantee: true, modelKind: 'bernoulli' },
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 50.5, costPerPull: 98.81, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Version 3.6 Phase 1 (Aug 20 - Oct 1, 2026)",
      featured: [
        { name: "Zhezhi", rate: 0.004 }
      ]
    }
  },
  {
    id: "bluearchive",
    title: "Blue Archive",
    publisher: "Nexon",
    curve: { baseRate: 0.007, hardPity: 200, winRate: 1, has50_50: false, modelKind: 'counter', guaranteeCost: 200 }, 
    pricing: { currency: "PHP", packPrice: 3990, pullsPerPack: 55, costPerPull: 72.55, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Global Banner (Aug 18 - Sep 1, 2026)",
      featured: [
        { name: "Dress Hina", rate: 0.007 }
      ]
    }
  },
  {
    id: "arknights_endfield",
    title: "Arknights: Endfield",
    publisher: "Hypergryph",
    curve: { baseRate: 0.006, softPityStart: 74, hardPity: 90, winRate: 0.5, has50_50: true, resetsCounterOnGuarantee: true, modelKind: 'bernoulli' }, 
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 50.5, costPerPull: 98.81, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Global Release (Aug 9 - 30, 2026)",
      featured: [
        { name: "Liino", rate: 0.003 }
      ]
    }
  },
  {
    id: "nikke",
    title: "Goddess of Victory: NIKKE",
    publisher: "Shift Up",
    curve: { baseRate: 0.02, hardPity: 200, winRate: 1, has50_50: false, modelKind: 'counter', guaranteeCost: 200 }, 
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 25, costPerPull: 199.6, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Evangelion Collab (From Aug 22, 2026)",
      featured: [
        { name: "Asuka", rate: 0.02 }
      ]
    }
  },
  {
    id: "fgo",
    title: "Fate/Grand Order",
    publisher: "Lasengle",
    curve: { baseRate: 0.008, hardPity: 330, winRate: 1, has50_50: false, modelKind: 'counter', guaranteeCost: 330 }, 
    pricing: { currency: "PHP", packPrice: 3990, pullsPerPack: 55.6, costPerPull: 71.76, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Banner TBD",
      featured: [
        { name: "Featured Servant", rate: 0.008 }
      ]
    }
  },
  {
    id: "epicseven",
    title: "Epic Seven",
    publisher: "Smilegate",
    curve: { baseRate: 0.01, hardPity: 120, winRate: 1, has50_50: false, modelKind: 'counter', guaranteeCost: 120 }, 
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 40, costPerPull: 124.75, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Secret Summer (Jun 25 - Aug 26, 2026)",
      featured: [
        { name: "Fumyr", rate: 0.01 }
      ]
    }
  },
  {
    id: "sla",
    title: "Solo Leveling: Arise",
    publisher: "Netmarble",
    curve: { baseRate: 0.012, softPityStart: 64, hardPity: 80, rampRate: 0.05, winRate: 0.5, has50_50: true, resetsCounterOnGuarantee: true, modelKind: 'bernoulli', guaranteeCost: 80 }, 
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 40, costPerPull: 124.75, pricingDisclaimer: "Based on official PHP pricing." },
    activeBanner: {
      name: "Banner TBD",
      featured: [
        { name: "Featured SSR", rate: 0.006 }
      ]
    }
  }
];