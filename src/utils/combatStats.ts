import { UserStats, User } from '../types/user';

export const calculateMaxHP = (strength: number, level: number): number => {
  return (strength * 10) + (level * 5);
};

export const calculateMaxMana = (intelligence: number, level: number): number => {
  return (intelligence * 10) + (level * 5);
};

export const calculateSpeed = (agility: number): number => {
  return agility * 2;
};

export const calculateLuck = (wisdom: number): number => {
  return wisdom * 1;
};

export const calculateAllCombatStats = (stats: UserStats, level: number) => {
  return {
    maxHP: calculateMaxHP(stats.strength, level),
    maxMana: calculateMaxMana(stats.intelligence, level),
    speed: calculateSpeed(stats.agility),
    luck: calculateLuck(stats.wisdom),
  };
};

// Damage calculations based on difficulty
export const calculateDungeonDamage = (
  difficulty: 'easy' | 'medium' | 'hard' | 'epic',
  success: boolean,
  maxHP: number,
  maxMana: number
): { hpLoss: number; manaLoss: number } => {
  const difficultyMultiplier = {
    easy: { win: 0.05, lose: 0.20 },
    medium: { win: 0.10, lose: 0.35 },
    hard: { win: 0.15, lose: 0.50 },
    epic: { win: 0.20, lose: 0.70 },
  };

  const multiplier = success 
    ? difficultyMultiplier[difficulty].win 
    : difficultyMultiplier[difficulty].lose;

  return {
    hpLoss: Math.floor(maxHP * multiplier),
    manaLoss: Math.floor(maxMana * multiplier),
  };
};

// Damage from failing tasks
export const calculateTaskDamage = (
  difficulty: string,
  maxHP: number,
  maxMana: number
): { hpLoss: number; manaLoss: number } => {
  const difficultyMultiplier: Record<string, number> = {
    trivial: 0.02,
    easy: 0.05,
    medium: 0.10,
    hard: 0.15,
    epic: 0.25,
  };

  const multiplier = difficultyMultiplier[difficulty] || 0.05;
  
  return {
    hpLoss: Math.floor(maxHP * multiplier),
    manaLoss: Math.floor(maxMana * multiplier),
  };
};

// HP/Mana gain from completing tasks
export const calculateTaskReward = (
  difficulty: string,
  maxHP: number,
  maxMana: number
): { hpGain: number; manaGain: number } => {
  const rewardMultiplier: Record<string, number> = {
    trivial: 0.03,
    easy: 0.05,
    medium: 0.10,
    hard: 0.15,
    epic: 0.25,
  };

  const multiplier = rewardMultiplier[difficulty] || 0.05;
  
  return {
    hpGain: Math.floor(maxHP * multiplier),
    manaGain: Math.floor(maxMana * multiplier),
  };
};