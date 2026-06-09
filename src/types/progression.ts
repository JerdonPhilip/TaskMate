export interface LevelThreshold {
  level: number;
  xpRequired: number;
  titleUnlock: string;
  statPointsGained: number;
}

export interface XPEvent {
  id: string;
  amount: number;
  source: 'quest_complete' | 'streak_bonus' | 'achievement' | 'difficulty_bonus';
  taskId?: string;
  timestamp: string;
}

export interface QuestLogEntry {
  id: string;
  taskId: string;
  action: 'created' | 'started' | 'completed' | 'failed' | 'abandoned';
  timestamp: string;
  xpGained?: number;
  goldGained?: number;
}