export type LootRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type LootSlot = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';

export interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: LootRarity;
  slot: LootSlot;
  icon: string;
  stats: {
    strength?: number;
    intelligence?: number;
    agility?: number;
    wisdom?: number;
  };
  buyPrice: number;
  sellPrice: number;
  levelRequired: number;
  dropChance: number;
}

export interface InventoryItem {
  id: string;
  lootId: string;
  name: string;
  rarity: LootRarity;
  slot: LootSlot;
  icon: string;
  stats: {
    strength?: number;
    intelligence?: number;
    agility?: number;
    wisdom?: number;
  };
  quantity: number;
  equipped: boolean;
  acquiredAt: string;
}

export interface Equipment {
  weapon: InventoryItem | null;
  armor: InventoryItem | null;
  accessory: InventoryItem | null;
}