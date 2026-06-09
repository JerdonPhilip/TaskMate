import { CharacterClass, UserStats } from '../types/user';

export interface ClassConfig {
  name: string;
  icon: string;
  description: string;
  color: string;
  baseStats: UserStats;
  statGrowthPerLevel: UserStats;
  primaryStat: keyof UserStats;
  secondaryStat: keyof UserStats;
}

export const CLASS_CONFIGS: Record<CharacterClass, ClassConfig> = {
  warrior: {
    name: 'Warrior',
    icon: '⚔️',
    description: 'Masters of strength and endurance',
    color: 'from-red-600 to-orange-600',
    baseStats: {
      strength: 8,
      intelligence: 3,
      agility: 5,
      wisdom: 4,
    },
    statGrowthPerLevel: {
      strength: 3,    // Primary - gains most per level
      intelligence: 1, // Weakest stat
      agility: 2,      // Secondary
      wisdom: 1,       // Lower growth
    },
    primaryStat: 'strength',
    secondaryStat: 'agility',
  },
  mage: {
    name: 'Mage',
    icon: '🔮',
    description: 'Wielders of arcane knowledge',
    color: 'from-blue-600 to-purple-600',
    baseStats: {
      strength: 3,
      intelligence: 8,
      agility: 4,
      wisdom: 5,
    },
    statGrowthPerLevel: {
      strength: 1,
      intelligence: 3, // Primary
      agility: 1,
      wisdom: 2,       // Secondary
    },
    primaryStat: 'intelligence',
    secondaryStat: 'wisdom',
  },
  rogue: {
    name: 'Rogue',
    icon: '🗡️',
    description: 'Swift and deadly assassins',
    color: 'from-green-600 to-teal-600',
    baseStats: {
      strength: 5,
      intelligence: 4,
      agility: 8,
      wisdom: 3,
    },
    statGrowthPerLevel: {
      strength: 2,     // Secondary
      intelligence: 1,
      agility: 3,      // Primary
      wisdom: 1,
    },
    primaryStat: 'agility',
    secondaryStat: 'strength',
  },
  cleric: {
    name: 'Cleric',
    icon: '✨',
    description: 'Divine healers and protectors',
    color: 'from-yellow-600 to-amber-600',
    baseStats: {
      strength: 4,
      intelligence: 5,
      agility: 3,
      wisdom: 8,
    },
    statGrowthPerLevel: {
      strength: 1,
      intelligence: 2,  // Secondary
      agility: 1,
      wisdom: 3,        // Primary
    },
    primaryStat: 'wisdom',
    secondaryStat: 'intelligence',
  },
};

export const getStatDescription = (stat: keyof UserStats): string => {
  const descriptions: Record<keyof UserStats, string> = {
    strength: 'Increases quest damage and carrying capacity',
    intelligence: 'Boosts XP gains and spell power',
    agility: 'Improves quest speed and dodge chance',
    wisdom: 'Enhances gold find and healing power',
  };
  return descriptions[stat];
};

export const getStatColor = (stat: keyof UserStats): string => {
  const colors: Record<keyof UserStats, string> = {
    strength: 'text-red-400',
    intelligence: 'text-blue-400',
    agility: 'text-green-400',
    wisdom: 'text-purple-400',
  };
  return colors[stat];
};

export const getStatIcon = (stat: keyof UserStats): string => {
  const icons: Record<keyof UserStats, string> = {
    strength: '💪',
    intelligence: '🧠',
    agility: '🏃',
    wisdom: '🦉',
  };
  return icons[stat];
};