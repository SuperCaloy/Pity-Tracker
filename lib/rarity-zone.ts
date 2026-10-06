export interface RarityZone {
  name: 'Void' | 'Jade' | 'Amethyst' | 'Gold';
  textClass: string;
  strokeClass: string;
  hex: string;
}

export function getRarityZone(pct: number): RarityZone {
  if (pct >= 95) return { name: 'Gold', textClass: 'text-rarity-gold', strokeClass: 'stroke-rarity-gold', hex: '#F0B429' };
  if (pct >= 80) return { name: 'Amethyst', textClass: 'text-rarity-amethyst', strokeClass: 'stroke-rarity-amethyst', hex: '#9C7CF4' };
  if (pct >= 50) return { name: 'Jade', textClass: 'text-rarity-jade', strokeClass: 'stroke-rarity-jade', hex: '#35C58A' };
  return { name: 'Void', textClass: 'text-foreground/50', strokeClass: 'stroke-foreground/10', hex: '' };
}