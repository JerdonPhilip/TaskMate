export type TaskStatus = 'backlog' | 'active' | 'completed' | 'failed';
export type TaskDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  tags: string[];
  xpReward: number;
  goldReward: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dueDate?: string;
  order: number;
  assignedClass?: 'warrior' | 'mage' | 'rogue' | 'cleric';
}

export interface TaskFormData {
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string;
  assignedClass?: Task['assignedClass'];
}