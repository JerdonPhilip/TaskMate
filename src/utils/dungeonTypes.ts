export interface DungeonType {
  id: string;
  name: string;
  icon: string;
  description: string;
  minLevel: number;
  baseXP: number;
  baseGold: number;
  theme: string;
  enemies: string[];
}

export const DUNGEON_TYPES: DungeonType[] = [
  {
    id: 'crypt',
    name: 'Ancient Crypt',
    icon: '💀',
    description: 'Dark tombs filled with undead',
    minLevel: 1,
    baseXP: 20,
    baseGold: 10,
    theme: 'Undead and dark magic',
    enemies: ['Skeletons', 'Zombies', 'Ghosts', 'Necromancers'],
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    icon: '🌲',
    description: 'Magical woods with mystical creatures',
    minLevel: 1,
    baseXP: 15,
    baseGold: 8,
    theme: 'Nature magic and fae creatures',
    enemies: ['Treants', 'Fairies', 'Wolves', 'Druids'],
  },
  {
    id: 'cave',
    name: 'Dragon\'s Lair',
    icon: '🐉',
    description: 'Fiery caves with treasure hoards',
    minLevel: 5,
    baseXP: 50,
    baseGold: 35,
    theme: 'Dragons and fire elementals',
    enemies: ['Fire Drakes', 'Lava Golems', 'Wyverns', 'Dragon'],
  },
  {
    id: 'tower',
    name: 'Wizard\'s Tower',
    icon: '🏰',
    description: 'Arcane tower with magical traps',
    minLevel: 3,
    baseXP: 35,
    baseGold: 20,
    theme: 'Arcane magic and constructs',
    enemies: ['Golems', 'Arcane Spirits', 'Mimics', 'Wizard'],
  },
  {
    id: 'dungeon',
    name: 'Dark Dungeon',
    icon: '🕳️',
    description: 'Classic dungeon with monsters',
    minLevel: 2,
    baseXP: 25,
    baseGold: 15,
    theme: 'Monsters and traps',
    enemies: ['Goblins', 'Trolls', 'Slimes', 'Dark Knights'],
  },
  {
    id: 'ruins',
    name: 'Forgotten Ruins',
    icon: '🏛️',
    description: 'Ancient civilization remnants',
    minLevel: 4,
    baseXP: 40,
    baseGold: 25,
    theme: 'Ancient technology and guardians',
    enemies: ['Stone Guardians', 'Cursed Spirits', 'Mummies', 'Anubis'],
  },
  {
    id: 'void',
    name: 'Void Rift',
    icon: '🌌',
    description: 'Reality-bending dimension',
    minLevel: 8,
    baseXP: 75,
    baseGold: 50,
    theme: 'Eldritch horrors and chaos',
    enemies: ['Void Walkers', 'Eldritch Horrors', 'Reality Shapers', 'Chaos Lords'],
  },
  {
    id: 'treasury',
    name: 'Golden Vault',
    icon: '💎',
    description: 'Treasure-filled vault with guardians',
    minLevel: 6,
    baseXP: 60,
    baseGold: 75,
    theme: 'Golems and wealth',
    enemies: ['Gold Golems', 'Vault Keepers', 'Mimic Kings', 'Greed Demons'],
  },
];