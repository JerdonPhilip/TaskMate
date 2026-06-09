import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, CharacterClass } from '../types/user';
import { generateId } from '../utils/uuid';
import { levelThresholds, getLevelForXP, getTitleForLevel } from '../utils/levelThresholds';

interface UserState {
  user: User | null;
  
  initializeUser: (name: string, characterClass: CharacterClass) => void;
  addXP: (amount: number, source: string, taskId?: string) => void;
  completeTask: (taskId: string, xpReward: number) => void;
  checkLevelUp: () => { leveledUp: boolean; newLevel?: number } | null;
  resetCharacter: () => void;
  getXPToNextLevel: () => number;
  getLevelProgress: () => number;
}

const createDefaultUser = (name: string, characterClass: CharacterClass): User => ({
  id: generateId(),
  name,
  level: 1,
  currentXP: 0,
  totalXP: 0,
  class: characterClass,
  title: 'novice',
  stats: {
    strength: characterClass === 'warrior' ? 8 : characterClass === 'cleric' ? 6 : 4,
    intelligence: characterClass === 'mage' ? 8 : characterClass === 'cleric' ? 6 : 4,
    agility: characterClass === 'rogue' ? 8 : characterClass === 'warrior' ? 6 : 4,
    wisdom: characterClass === 'cleric' ? 8 : characterClass === 'mage' ? 6 : 4,
  },
  achievements: [],
  questsCompleted: 0,
  questsFailed: 0,
  streaks: {
    currentStreak: 0,
    longestStreak: 0,
  },
});

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

          return {
            user: {
              ...state.user,
              currentXP: newCurrentXP,
              totalXP: newTotalXP,
              level: newLevel,
              title: getTitleForLevel(newLevel),
              ...(leveledUp && {
                stats: {
                  ...state.user.stats,
                  [getRandomStat()]: state.user.stats[getRandomStat()] + 1,
                },
              }),
            },
          };
        });
      },

      completeTask: (taskId, xpReward) => {
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

          const streakBonus = Math.floor(xpReward * (newStreak * 0.1));
          const totalXP = xpReward + streakBonus;

          return {
            user: {
              ...state.user,
              questsCompleted: state.user.questsCompleted + 1,
              currentXP: state.user.currentXP + totalXP,
              totalXP: state.user.totalXP + totalXP,
              level: getLevelForXP(state.user.totalXP + totalXP),
              title: getTitleForLevel(getLevelForXP(state.user.totalXP + totalXP)),
              streaks: {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, state.user.streaks.longestStreak),
                lastCompletedDate: today,
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

function getRandomStat(): keyof User['stats'] {
  const stats: (keyof User['stats'])[] = ['strength', 'intelligence', 'agility', 'wisdom'];
  return stats[Math.floor(Math.random() * stats.length)];
}