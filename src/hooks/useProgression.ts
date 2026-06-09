import { useEffect, useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';

export function useProgression() {
  const user = useUserStore((state) => state.user);
  const completeTask = useUserStore((state) => state.completeTask);
  const checkLevelUp = useUserStore((state) => state.checkLevelUp);
  
  const handleTaskComplete = useCallback((taskId: string, xpReward: number, goldReward: number) => {
    // Pass both XP and Gold to completeTask
    completeTask(taskId, xpReward, goldReward);
    const levelUpResult = checkLevelUp();
    
    if (levelUpResult?.leveledUp) {
      window.dispatchEvent(
        new CustomEvent('level-up', {
          detail: { newLevel: levelUpResult.newLevel },
        })
      );
    }
  }, [completeTask, checkLevelUp]);

  useEffect(() => {
    const handleTaskCompleted = (event: CustomEvent) => {
      const { taskId, xpReward, goldReward } = event.detail;
      handleTaskComplete(taskId, xpReward, goldReward);
    };

    window.addEventListener('task-completed', handleTaskCompleted as EventListener);
    return () => {
      window.removeEventListener('task-completed', handleTaskCompleted as EventListener);
    };
  }, [handleTaskComplete]);

  return {
    user,
    handleTaskComplete,
  };
}