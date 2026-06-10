export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'cleric';
export type Title = 'novice' | 'apprentice' | 'adept' | 'master' | 'legend';

export interface User {
  id: string;
  name: string;
  level: number;
  currentXP: number;
  totalXP: number;
  gold: number;
  class: CharacterClass;
  title: Title;
  stats: UserStats;
  statPoints: number;
  achievements: Achievement[];
  questsCompleted: number;
  questsFailed: number;
  streaks: StreakData;
  // NEW - HP and Mana
  currentHP: number;
  maxHP: number;
  currentMana: number;
  maxMana: number;
}

export interface UserStats {
  strength: number;
  intelligence: number;
  agility: number;
  wisdom: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}