import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, CharacterClass, UserStats } from '../types/user';
import { generateId } from '../utils/uuid';
import { levelThresholds, getLevelForXP, getTitleForLevel } from '../utils/levelThresholds';
import { CLASS_CONFIGS } from '../utils/classStats';
import { calculateMaxHP, calculateMaxMana, calculateAllCombatStats } from '../utils/combatStats';
import { getPotionById } from '../data/potionShop';
import { secureStorage } from '../utils/secureStorage';

interface UserState {
  user: User | null;
  
  initializeUser: (name: string, characterClass: CharacterClass) => void;
  addXP: (amount: number, source: string, taskId?: string) => void;
  addGold: (amount: number) => void;
  completeTask: (taskId: string, xpReward: number, goldReward: number) => void;
  allocateStatPoint: (stat: keyof UserStats) => void;
  checkLevelUp: () => { leveledUp: boolean; newLevel?: number } | null;
  resetCharacter: () => void;
  getXPToNextLevel: () => number;
  getLevelProgress: () => number;
  updateHP: (amount: number) => void;
  updateMana: (amount: number) => void;
  usePotion: (potionId: string) => boolean;
  takeDamage: (hpLoss: number, manaLoss: number) => void;
  restoreAfterRest: () => void;
  calculateMaxStats: () => { maxHP: number; maxMana: number; speed: number; luck: number };
}

const createDefaultUser = (name: string, characterClass: CharacterClass): User => {
  const classConfig = CLASS_CONFIGS[characterClass];
  const baseStats = classConfig.baseStats;
  
  return {
    id: generateId(),
    name,
    level: 1,
    currentXP: 0,
    totalXP: 0,
    gold: 0,
    class: characterClass,
    title: 'novice',
    stats: { ...baseStats },
    statPoints: 0,
    achievements: [],
    questsCompleted: 0,
    questsFailed: 0,
    streaks: {
      currentStreak: 0,
      longestStreak: 0,
    },
    currentHP: calculateMaxHP(baseStats.strength, 1),
    maxHP: calculateMaxHP(baseStats.strength, 1),
    currentMana: calculateMaxMana(baseStats.intelligence, 1),
    maxMana: calculateMaxMana(baseStats.intelligence, 1),
  };
};

// Create encrypted storage adapter
const encryptedStorage = {
  getItem: (name: string): string | null => {
    try {
      const value = secureStorage.getItem(name);
      return value ? JSON.stringify(value) : null;
    } catch {
      // Fallback to regular localStorage
      return localStorage.getItem(name);
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      secureStorage.setItem(name, JSON.parse(value));
    } catch {
      // Fallback to regular localStorage
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    secureStorage.removeItem(name);
    localStorage.removeItem(name);
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,

      initializeUser: (name, characterClass) => {
        if (!get().user) {
          set({ user: createDefaultUser(name, characterClass) });
        }
      },

      addXP: (amount, source, taskId) => {
        set((state) => {
          if (!state.user) return state;

          const newTotalXP = state.user.totalXP + amount;
          const newCurrentXP = state.user.currentXP + amount;
          const newLevel = getLevelForXP(newTotalXP);
          const leveledUp = newLevel > state.user.level;
          const levelsGained = newLevel - state.user.level;
          const newStatPoints = levelsGained > 0 ? state.user.statPoints + (levelsGained * 2) : state.user.statPoints;

          const newMaxHP = calculateMaxHP(state.user.stats.strength, newLevel);
          const newMaxMana = calculateMaxMana(state.user.stats.intelligence, newLevel);

          return {
            user: {
              ...state.user,
              currentXP: newCurrentXP,
              totalXP: newTotalXP,
              level: newLevel,
              title: getTitleForLevel(newLevel),
              statPoints: newStatPoints,
              maxHP: newMaxHP,
              maxMana: newMaxMana,
              currentHP: newMaxHP,
              currentMana: newMaxMana,
            },
          };
        });
      },

      addGold: (amount) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              gold: state.user.gold + amount,
            },
          };
        });
      },

      completeTask: (taskId, xpReward, goldReward) => {
        set((state) => {
          if (!state.user) return state;

          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const lastCompletedDate = state.user.streaks.lastCompletedDate;

          let newStreak = state.user.streaks.currentStreak;

          if (lastCompletedDate === today) {
            // Already completed today
          } else if (lastCompletedDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }

          const streakBonus = Math.floor((xpReward + goldReward) * (newStreak * 0.1));
          const totalXP = xpReward + streakBonus;
          const totalGold = goldReward + Math.floor(streakBonus / 2);

          const newTotalXP = state.user.totalXP + totalXP;
          const newLevel = getLevelForXP(newTotalXP);
          const levelsGained = newLevel - state.user.level;
          const newStatPoints = levelsGained > 0 ? state.user.statPoints + (levelsGained * 2) : state.user.statPoints;

          let updatedStats = { ...state.user.stats };
          if (levelsGained > 0) {
            const classConfig = CLASS_CONFIGS[state.user.class];
            for (let i = 0; i < levelsGained; i++) {
              updatedStats = {
                strength: updatedStats.strength + classConfig.statGrowthPerLevel.strength,
                intelligence: updatedStats.intelligence + classConfig.statGrowthPerLevel.intelligence,
                agility: updatedStats.agility + classConfig.statGrowthPerLevel.agility,
                wisdom: updatedStats.wisdom + classConfig.statGrowthPerLevel.wisdom,
              };
            }
          }

          const newMaxHP = calculateMaxHP(updatedStats.strength, newLevel);
          const newMaxMana = calculateMaxMana(updatedStats.intelligence, newLevel);

          return {
            user: {
              ...state.user,
              questsCompleted: state.user.questsCompleted + 1,
              currentXP: state.user.currentXP + totalXP,
              totalXP: newTotalXP,
              gold: state.user.gold + totalGold,
              level: newLevel,
              title: getTitleForLevel(newLevel),
              stats: updatedStats,
              statPoints: newStatPoints,
              maxHP: newMaxHP,
              maxMana: newMaxMana,
              currentHP: newMaxHP,
              currentMana: newMaxMana,
              streaks: {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, state.user.streaks.longestStreak),
                lastCompletedDate: today,
              },
            },
          };
        });
      },

      allocateStatPoint: (stat) => {
        set((state) => {
          if (!state.user || state.user.statPoints <= 0) return state;

          const newStats = {
            ...state.user.stats,
            [stat]: state.user.stats[stat] + 1,
          };

          const newMaxHP = calculateMaxHP(newStats.strength, state.user.level);
          const newMaxMana = calculateMaxMana(newStats.intelligence, state.user.level);

          return {
            user: {
              ...state.user,
              statPoints: state.user.statPoints - 1,
              stats: newStats,
              maxHP: newMaxHP,
              maxMana: newMaxMana,
              currentHP: Math.min(state.user.currentHP, newMaxHP),
              currentMana: Math.min(state.user.currentMana, newMaxMana),
            },
          };
        });
      },

      checkLevelUp: () => {
        const { user } = get();
        if (!user) return null;

        const newLevel = getLevelForXP(user.totalXP);
        if (newLevel > user.level) {
          return { leveledUp: true, newLevel };
        }
        return null;
      },

      resetCharacter: () => {
        set({ user: null });
      },

      getXPToNextLevel: () => {
        const { user } = get();
        if (!user) return 0;

        const currentLevelThreshold = levelThresholds.find(
          (t) => t.level === user.level
        );
        const nextLevelThreshold = levelThresholds.find(
          (t) => t.level === user.level + 1
        );

        if (!currentLevelThreshold || !nextLevelThreshold) return 0;
        return nextLevelThreshold.xpRequired - currentLevelThreshold.xpRequired;
      },

      getLevelProgress: () => {
        const { user } = get();
        if (!user) return 0;

        const currentLevelThreshold = levelThresholds.find(
          (t) => t.level === user.level
        );
        const nextLevelThreshold = levelThresholds.find(
          (t) => t.level === user.level + 1
        );

        if (!currentLevelThreshold || !nextLevelThreshold) return 0;

        const xpIntoLevel = user.totalXP - currentLevelThreshold.xpRequired;
        const xpRequired = nextLevelThreshold.xpRequired - currentLevelThreshold.xpRequired;
        return (xpIntoLevel / xpRequired) * 100;
      },

      updateHP: (amount) => {
        set((state) => {
          if (!state.user) return state;
          const newHP = Math.max(0, Math.min(state.user.maxHP, state.user.currentHP + amount));
          return { user: { ...state.user, currentHP: newHP } };
        });
      },

      updateMana: (amount) => {
        set((state) => {
          if (!state.user) return state;
          const newMana = Math.max(0, Math.min(state.user.maxMana, state.user.currentMana + amount));
          return { user: { ...state.user, currentMana: newMana } };
        });
      },

      usePotion: (potionId) => {
        const state = get();
        if (!state.user) return false;
        
        const potion = getPotionById(potionId);
        if (!potion) return false;
        
        if (potion.type === 'hp') {
          get().updateHP(potion.restoreAmount);
        } else {
          get().updateMana(potion.restoreAmount);
        }
        
        return true;
      },

      takeDamage: (hpLoss, manaLoss) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              currentHP: Math.max(0, state.user.currentHP - hpLoss),
              currentMana: Math.max(0, state.user.currentMana - manaLoss),
            },
          };
        });
      },

      restoreAfterRest: () => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              currentHP: state.user.maxHP,
              currentMana: state.user.maxMana,
            },
          };
        });
      },

      calculateMaxStats: () => {
        const state = get();
        if (!state.user) return { maxHP: 0, maxMana: 0, speed: 0, luck: 0 };
        
        return calculateAllCombatStats(state.user.stats, state.user.level);
      },
    }),
    {
      name: 'taskmate-user',
      storage: createJSONStorage(() => encryptedStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

function getRandomStat(): keyof User['stats'] {
  const stats: (keyof User['stats'])[] = ['strength', 'intelligence', 'agility', 'wisdom'];
  return stats[Math.floor(Math.random() * stats.length)];
}