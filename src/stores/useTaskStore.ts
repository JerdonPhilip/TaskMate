import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task, TaskFormData, TaskStatus, TaskDifficulty } from "../types/types";
import { QuestLogEntry } from "../types/progression";
import { generateId } from "../utils/uuid";
import { calculateTaskDamage, calculateTaskReward } from "../utils/combatStats";
import { useUserStore } from "./useUserStore";
import { useInventoryStore } from "./useInventoryStore";
import { secureStorage } from '../utils/secureStorage';

interface TaskState {
  tasks: Task[];
  questLog: QuestLogEntry[];

  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  reorderTasks: (status: TaskStatus, taskIds: string[]) => void;
  completeTask: (taskId: string) => void;
  failTask: (taskId: string) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  clearAllTasks: () => void; // NEW
}

const calculateXPReward = (difficulty: TaskDifficulty): number => {
  const xpMap = {
    trivial: 5,
    easy: 10,
    medium: 25,
    hard: 50,
    epic: 100,
  };
  return xpMap[difficulty];
};

const calculateGoldReward = (difficulty: TaskDifficulty): number => {
  const goldMap = {
    trivial: 1,
    easy: 5,
    medium: 15,
    hard: 35,
    epic: 75,
  };
  return goldMap[difficulty];
};

const encryptedStorage = {
  getItem: (name: string): string | null => {
    try {
      const value = secureStorage.getItem(name);
      return value ? JSON.stringify(value) : null;
    } catch {
      return localStorage.getItem(name);
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      secureStorage.setItem(name, JSON.parse(value));
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    secureStorage.removeItem(name);
    localStorage.removeItem(name);
  },
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      questLog: [],

      addTask: (data) => {
        const task: Task = {
          id: generateId(),
          ...data,
          status: "backlog",
          xpReward: calculateXPReward(data.difficulty),
          goldReward: calculateGoldReward(data.difficulty),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: get().getTasksByStatus("backlog").length,
        };

        set((state) => ({
          tasks: [...state.tasks, task],
          questLog: [
            ...state.questLog,
            {
              id: generateId(),
              taskId: task.id,
              action: "created",
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task,
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          questLog: [
            ...state.questLog,
            {
              id: generateId(),
              taskId: id,
              action: "abandoned",
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      },

      moveTask: (taskId, newStatus, newOrder) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;

          const action = newStatus === "active" ? "started" : undefined;

          return {
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    status: newStatus,
                    order: newOrder,
                    updatedAt: new Date().toISOString(),
                  }
                : t,
            ),
            questLog: action
              ? [
                  ...state.questLog,
                  {
                    id: generateId(),
                    taskId,
                    action,
                    timestamp: new Date().toISOString(),
                  },
                ]
              : state.questLog,
          };
        });
      },

      reorderTasks: (status, taskIds) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.status === status) {
              const newOrder = taskIds.indexOf(task.id);
              return newOrder !== -1 ? { ...task, order: newOrder } : task;
            }
            return task;
          }),
        }));
      },

      completeTask: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || task.status === "completed") return;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
          questLog: [
            ...state.questLog,
            {
              id: generateId(),
              taskId,
              action: "completed",
              timestamp: new Date().toISOString(),
              xpGained: task.xpReward,
              goldGained: task.goldReward,
            },
          ],
        }));

        // Apply small HP/Mana recovery for completing tasks
        const userStore = useUserStore.getState();
        if (userStore.user) {
          const rewards = calculateTaskReward(
            task.difficulty,
            userStore.user.maxHP,
            userStore.user.maxMana,
          );
          userStore.updateHP(rewards.hpGain);
          userStore.updateMana(rewards.manaGain);
        }

        const inventoryStore = useInventoryStore.getState();
        inventoryStore.addGold(task.goldReward);

        window.dispatchEvent(
          new CustomEvent("task-completed", {
            detail: {
              taskId,
              xpReward: task.xpReward,
              goldReward: task.goldReward,
            },
          }),
        );
      },

      failTask: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: "failed", updatedAt: new Date().toISOString() }
              : t,
          ),
          questLog: [
            ...state.questLog,
            {
              id: generateId(),
              taskId,
              action: "failed",
              timestamp: new Date().toISOString(),
            },
          ],
        }));

        // Apply damage for failing tasks
        if (task) {
          const userStore = useUserStore.getState();
          if (userStore.user) {
            const damage = calculateTaskDamage(
              task.difficulty,
              userStore.user.maxHP,
              userStore.user.maxMana,
            );
            userStore.takeDamage(damage.hpLoss, damage.manaLoss);

            // Show notification
            window.dispatchEvent(
              new CustomEvent("show-notification", {
                detail: {
                  message: `💀 Task failed! Lost ${damage.hpLoss} HP and ${damage.manaLoss} Mana`,
                  type: "error",
                },
              }),
            );
          }
        }
      },

      getTasksByStatus: (status) => {
        return get()
          .tasks.filter((task) => task.status === status)
          .sort((a, b) => a.order - b.order);
      },

      // NEW: Clear all tasks and quest log
      clearAllTasks: () => {
        set({ tasks: [], questLog: [] });
      },
    }),
    {
      name: "taskmate-tasks",
      storage: createJSONStorage(() => encryptedStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        questLog: state.questLog,
      }),
    },
  ),
);
