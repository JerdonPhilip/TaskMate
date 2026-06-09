import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task, TaskFormData, TaskStatus, TaskDifficulty } from '../types/types';
import { QuestLogEntry } from '../types/progression';
import { generateId } from '../utils/uuid';

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
}

const calculateXPReward = (difficulty: TaskDifficulty): number => {
  const xpMap = {
    trivial: 5,
    easy: 10,
    medium: 25,
    hard: 50,
    epic: 100
  };
  return xpMap[difficulty];
};

const calculateGoldReward = (difficulty: TaskDifficulty): number => {
  const goldMap = {
    trivial: 1,
    easy: 5,
    medium: 15,
    hard: 35,
    epic: 75
  };
  return goldMap[difficulty];
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
          status: 'backlog',
          xpReward: calculateXPReward(data.difficulty),
          goldReward: calculateGoldReward(data.difficulty),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: get().getTasksByStatus('backlog').length,
        };

        set((state) => ({
          tasks: [...state.tasks, task],
          questLog: [
            ...state.questLog,
            {
              id: generateId(),
              taskId: task.id,
              action: 'created',
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
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      moveTask: (taskId, newStatus, newOrder) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: newStatus, order: newOrder, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
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
        if (!task || task.status === 'completed') return;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
          questLog: [
            ...state.questLog,
            {
              id: generateId(),
              taskId,
              action: 'completed',
              timestamp: new Date().toISOString(),
              xpGained: task.xpReward,
              goldGained: task.goldReward,
            },
          ],
        }));

        // Dispatch event with both XP and Gold
        window.dispatchEvent(
          new CustomEvent('task-completed', {
            detail: { 
              taskId, 
              xpReward: task.xpReward, 
              goldReward: task.goldReward 
            },
          })
        );
      },

      failTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'failed', updatedAt: new Date().toISOString() }
              : t
          ),
          questLog: [
            ...state.questLog,
            {
              id: generateId(),
              taskId,
              action: 'failed',
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      },

      getTasksByStatus: (status) => {
        return get()
          .tasks.filter((task) => task.status === status)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'taskmate-tasks',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        questLog: state.questLog,
      }),
    }
  )
);