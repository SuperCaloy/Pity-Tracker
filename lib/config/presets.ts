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
    curve: { baseRate: 0.006, softPityStart: 74, hardPity: 90, rampRate: 0.06, winRate: 0.5 },
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 55.6, costPerPull: 89.78, pricingDisclaimer: "Approximate, calculated from official USD pricing (w/ 23.5% regional bonus)." },
    activeBanner: {
      name: "Version 7.0 Phase 1 (Aug 12 - Sep 1, 2026)",
      featured: [
        { name: "Odette (New)", rate: 0.003 },
        { name: "Arlecchino (Rerun)", rate: 0.003 }
      ]
    }
  },
  {
    id: "hsr",
    title: "Honkai: Star Rail",
    publisher: "HoYoverse",
    curve: { baseRate: 0.006, softPityStart: 74, hardPity: 90, rampRate: 0.06, winRate: 0.5 },
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 55.6, costPerPull: 89.78, pricingDisclaimer: "Approximate, calculated from official USD pricing (w/ 23.5% regional bonus)." },
    activeBanner: {
      name: "Version 4.4 (Jul 15 - Aug 25, 2026)",
      featured: [
        { name: "Himeko Nova", rate: 0.003 },
        { name: "Anaxa", rate: 0.003 }
      ]
    }
  },
  {
    id: "zzz",
    title: "Zenless Zone Zero",
    publisher: "HoYoverse",
    curve: { baseRate: 0.006, softPityStart: 80, hardPity: 90, rampRate: 0.09, winRate: 0.5 },
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 55.6, costPerPull: 89.78, pricingDisclaimer: "Approximate, calculated from official USD pricing (w/ 23.5% regional bonus)." },
    activeBanner: {
      name: "Version 3.1 (Jul 29 - Sep 8, 2026)",
      featured: [
        { name: "Remielle", rate: 0.003 },
        { name: "Aria", rate: 0.003 }
      ]
    }
  },
  {
    id: "wuwa",
    title: "Wuthering Waves",
    publisher: "Kuro Games",
    curve: { baseRate: 0.008, softPityStart: 66, hardPity: 80, rampRate: 0.06, winRate: 0.5 },
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 50.5, costPerPull: 110.88, pricingDisclaimer: "Based on last verified official USD pricing." },
    activeBanner: {
      name: "Version 3.5 (Jul 30 - Aug 19, 2026)",
      featured: [
        { name: "Suisui", rate: 0.004 },
        { name: "Aemeath", rate: 0.004 }
      ]
    }
  },
  {
    id: "bluearchive",
    title: "Blue Archive",
    publisher: "Nexon",
    curve: { baseRate: 0.007, hardPity: 200, winRate: 1 }, 
    pricing: { currency: "PHP", packPrice: 3990, pullsPerPack: 55, costPerPull: 81.20, pricingDisclaimer: "Based on last verified official USD pricing." },
    activeBanner: {
      name: "Global Banner (Aug 18 - Sep 1, 2026)",
      featured: [
        { name: "Niko (Limited)", rate: 0.007 },
        { name: "Kurumi (Limited)", rate: 0.007 }
      ]
    }
  },
  {
    id: "arknights_endfield",
    title: "Arknights: Endfield",
    publisher: "Hypergryph",
    curve: { baseRate: 0.006, softPityStart: 74, hardPity: 90, winRate: 0.5 }, 
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 50.5, costPerPull: 110.88, pricingDisclaimer: "Based on last verified official USD pricing." },
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
    curve: { baseRate: 0.02, hardPity: 200, winRate: 1 }, 
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 25, costPerPull: 223.44, pricingDisclaimer: "Based on last verified official USD pricing." },
    activeBanner: {
      name: "Persona Collab (From Aug 13, 2026)",
      featured: [
        { name: "Maxwell (Limited)", rate: 0.02 },
        { name: "Queen (Collab)", rate: 0.02 },
        { name: "Yukiko (Collab)", rate: 0.02 }
      ]
    }
  },
  {
    id: "fgo",
    title: "Fate/Grand Order",
    publisher: "Lasengle",
    curve: { baseRate: 0.008, hardPity: 330, winRate: 1 }, 
    pricing: { currency: "PHP", packPrice: 3990, pullsPerPack: 55.6, costPerPull: 80.08, pricingDisclaimer: "Based on last verified official USD pricing." },
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
    curve: { baseRate: 0.01, hardPity: 120, winRate: 1 }, 
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 40, costPerPull: 139.44, pricingDisclaimer: "Based on last verified official USD pricing." },
    activeBanner: {
      name: "Secret Summer (Jun 25 - Aug 26, 2026)",
      featured: [
        { name: "Fumyr", rate: 0.01 },
        { name: "Aube", rate: 0.01 },
        { name: "Tidal Rited Elvira", rate: 0.01 }
      ]
    }
  },
  {
    id: "sla",
    title: "Solo Leveling: Arise",
    publisher: "Netmarble",
    curve: { baseRate: 0.012, softPityStart: 64, hardPity: 80, rampRate: 0.05, winRate: 0.5 }, 
    pricing: { currency: "PHP", packPrice: 4990, pullsPerPack: 40, costPerPull: 139.44, pricingDisclaimer: "Based on last verified official USD pricing." },
    activeBanner: {
      name: "Banner TBD",
      featured: [
        { name: "Featured SSR", rate: 0.006 }
      ]
    }
  }
];