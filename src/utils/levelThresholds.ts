import { LevelThreshold } from '../types/progression';
import { Title } from '../types/user';

export const levelThresholds: LevelThreshold[] = [
  { level: 1, xpRequired: 0, titleUnlock: 'Novice Adventurer', statPointsGained: 0 },
  { level: 2, xpRequired: 50, titleUnlock: 'Apprentice Quest Seeker', statPointsGained: 1 },
  { level: 3, xpRequired: 125, titleUnlock: 'Journeyman Explorer', statPointsGained: 1 },
  { level: 4, xpRequired: 250, titleUnlock: 'Adept Pathfinder', statPointsGained: 1 },
  { level: 5, xpRequired: 500, titleUnlock: 'Skilled Wayfarer', statPointsGained: 2 },
  { level: 6, xpRequired: 800, titleUnlock: 'Expert Trailblazer', statPointsGained: 2 },
  { level: 7, xpRequired: 1200, titleUnlock: 'Veteran Champion', statPointsGained: 2 },
  { level: 8, xpRequired: 1800, titleUnlock: 'Elite Quest Master', statPointsGained: 3 },
  { level: 9, xpRequired: 2600, titleUnlock: 'Master of Realms', statPointsGained: 3 },
  { level: 10, xpRequired: 3600, titleUnlock: 'Grandmaster Adventurer', statPointsGained: 3 },
  { level: 15, xpRequired: 5000, titleUnlock: 'Legendary Hero', statPointsGained: 5 },
  { level: 20, xpRequired: 10000, titleUnlock: 'Mythic Paragon', statPointsGained: 5 },
  { level: 30, xpRequired: 20000, titleUnlock: 'Eternal Champion', statPointsGained: 5 },
  { level: 50, xpRequired: 50000, titleUnlock: 'Divine Ascendant', statPointsGained: 10 },
  { level: 99, xpRequired: 100000, titleUnlock: 'God of Quests', statPointsGained: 20 },
];

export function getLevelForXP(totalXP: number): number {
  let level = 1;
  for (const threshold of levelThresholds) {
    if (totalXP >= threshold.xpRequired) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
}

export function getTitleForLevel(level: number): Title {
  if (level >= 50) return 'legend';
  if (level >= 30) return 'master';
  if (level >= 20) return 'adept';
  if (level >= 10) return 'apprentice';
  return 'novice';
}

export function getXPForNextLevel(currentLevel: number): number {
  const nextThreshold = levelThresholds.find(t => t.level === currentLevel + 1);
  return nextThreshold ? nextThreshold.xpRequired : Infinity;
}

export function getCurrentLevelXP(currentLevel: number): number {
  const currentThreshold = levelThresholds.find(t => t.level === currentLevel);
  return currentThreshold ? currentThreshold.xpRequired : 0;
}