export interface Potion {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'hp' | 'mana';
  restoreAmount: number;
  buyPrice: number;
  sellPrice: number;
  levelRequired: number;
  rarity: 'common' | 'uncommon' | 'rare';
}

export const POTIONS: Potion[] = [
  // HP Potions
  {
    id: 'small_hp_potion',
    name: 'Small HP Potion',
    description: 'Restores a small amount of health.',
    icon: '🧪',
    type: 'hp',
    restoreAmount: 15,
    buyPrice: 25,
    sellPrice: 8,
    levelRequired: 1,
    rarity: 'common',
  },
  {
    id: 'medium_hp_potion',
    name: 'Medium HP Potion',
    description: 'Restores a moderate amount of health.',
    icon: '🧪',
    type: 'hp',
    restoreAmount: 45,
    buyPrice: 60,
    sellPrice: 20,
    levelRequired: 3,
    rarity: 'uncommon',
  },
  {
    id: 'large_hp_potion',
    name: 'Large HP Potion',
    description: 'Restores a large amount of health.',
    icon: '🧪',
    type: 'hp',
    restoreAmount: 90,
    buyPrice: 120,
    sellPrice: 40,
    levelRequired: 5,
    rarity: 'rare',
  },
  // Mana Potions
  {
    id: 'small_mana_potion',
    name: 'Small Mana Potion',
    description: 'Restores a small amount of mana.',
    icon: '🧪',
    type: 'mana',
    restoreAmount: 15,
    buyPrice: 25,
    sellPrice: 8,
    levelRequired: 1,
    rarity: 'common',
  },
  {
    id: 'medium_mana_potion',
    name: 'Medium Mana Potion',
    description: 'Restores a moderate amount of mana.',
    icon: '🧪',
    type: 'mana',
    restoreAmount: 45,
    buyPrice: 60,
    sellPrice: 20,
    levelRequired: 3,
    rarity: 'uncommon',
  },
  {
    id: 'large_mana_potion',
    name: 'Large Mana Potion',
    description: 'Restores a large amount of mana.',
    icon: '🧪',
    type: 'mana',
    restoreAmount: 90,
    buyPrice: 120,
    sellPrice: 40,
    levelRequired: 5,
    rarity: 'rare',
  },
];

export const getPotionById = (id: string): Potion | undefined => {
  return POTIONS.find(p => p.id === id);
};

export const getAvailablePotions = (playerLevel: number): Potion[] => {
  return POTIONS.filter(p => p.levelRequired <= playerLevel);
};