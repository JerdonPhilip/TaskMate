import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, CharacterClass, UserStats } from '../types/user';
import { generateId } from '../utils/uuid';
import { levelThresholds, getLevelForXP, getTitleForLevel } from '../utils/levelThresholds';
import { CLASS_CONFIGS } from '../utils/classStats';

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
}

const createDefaultUser = (name: string, characterClass: CharacterClass): User => {
  const classConfig = CLASS_CONFIGS[characterClass];
  return {
    id: generateId(),
    name,
    level: 1,
    currentXP: 0,
    totalXP: 0,
    gold: 0,
    class: characterClass,
    title: 'novice',
    stats: { ...classConfig.baseStats },
    statPoints: 0, // Start with 0 stat points
    achievements: [],
    questsCompleted: 0,
    questsFailed: 0,
    streaks: {
      currentStreak: 0,
      longestStreak: 0,
    },
  };
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

          // Calculate stat points gained (2 points per level up)
          const levelsGained = newLevel - state.user.level;
          const newStatPoints = levelsGained > 0 ? state.user.statPoints + (levelsGained * 2) : state.user.statPoints;

          return {
            user: {
              ...state.user,
              currentXP: newCurrentXP,
              totalXP: newTotalXP,
              level: newLevel,
              title: getTitleForLevel(newLevel),
              statPoints: newStatPoints,
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

          // Auto-allocate stats based on class growth when leveling up
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
              streaks: {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, state.user.streaks.longestStreak),
                lastCompletedDate: today,
              },
            },
          };
        });
      },

      // NEW: Allocate stat points manually
      allocateStatPoint: (stat) => {
        set((state) => {
          if (!state.user || state.user.statPoints <= 0) return state;

          return {
            user: {
              ...state.user,
              statPoints: state.user.statPoints - 1,
              stats: {
                ...state.user.stats,
                [stat]: state.user.stats[stat] + 1,
              },
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
    }),
    {
      name: 'taskmate-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);