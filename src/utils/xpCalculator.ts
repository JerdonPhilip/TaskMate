import { TaskDifficulty } from '../types/task';

export const XP_BASE_VALUES = {
  trivial: 5,
  easy: 10,
  medium: 25,
  hard: 50,
  epic: 100,
};

export const GOLD_BASE_VALUES = {
  trivial: 1,
  easy: 5,
  medium: 15,
  hard: 35,
  epic: 75,
};

export function calculateXP(
  difficulty: TaskDifficulty,
  streakMultiplier: number = 1,
  hasSpeedBonus: boolean = false
): number {
  let baseXP = XP_BASE_VALUES[difficulty];
  let totalXP = baseXP * streakMultiplier;
  
  if (hasSpeedBonus) {
    totalXP *= 1.5;
  }
  
  return Math.floor(totalXP);
}

export function calculateGold(
  difficulty: TaskDifficulty,
  streakMultiplier: number = 1
): number {
  let baseGold = GOLD_BASE_VALUES[difficulty];
  return Math.floor(baseGold * streakMultiplier);
}

export function getDifficultyColor(difficulty: TaskDifficulty): string {
  const colors = {
    trivial: 'text-gray-400',
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-orange-400',
    epic: 'text-purple-400',
  };
  return colors[difficulty];
}

export function getDifficultyIcon(difficulty: TaskDifficulty): string {
  const icons = {
    trivial: '🌱',
    easy: '⚔️',
    medium: '🛡️',
    hard: '💀',
    epic: '👑',
  };
  return icons[difficulty];
}