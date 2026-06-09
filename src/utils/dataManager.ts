import { useTaskStore } from '../stores/useTaskStore';
import { useUserStore } from '../stores/useUserStore';

interface BackupData {
  version: string;
  timestamp: string;
  tasks: any;
  user: any;
  questLog: any;
}

// Export data to JSON file
export const exportData = (): void => {
  try {
    const tasks = JSON.parse(localStorage.getItem('taskmate-tasks') || '{}');
    const user = JSON.parse(localStorage.getItem('taskmate-user') || '{}');
    
    const backupData: BackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      tasks: tasks.state || tasks,
      user: user.state || user,
      questLog: tasks.state?.questLog || [],
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskmate-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show success notification
    window.dispatchEvent(
      new CustomEvent('show-notification', {
        detail: { 
          message: '✅ Data exported successfully!', 
          type: 'success' 
        },
      })
    );
  } catch (error) {
    console.error('Export failed:', error);
    window.dispatchEvent(
      new CustomEvent('show-notification', {
        detail: { 
          message: '❌ Failed to export data', 
          type: 'error' 
        },
      })
    );
  }
};

// Import data from JSON file
export const importData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data: BackupData = JSON.parse(e.target?.result as string);
        
        // Validate backup data
        if (!data.version || !data.tasks || !data.user) {
          throw new Error('Invalid backup file format');
        }

        // Confirm before restoring
        if (confirm('⚠️ This will replace ALL current data. Are you sure you want to restore this backup?')) {
          // Restore tasks
          if (data.tasks.tasks) {
            localStorage.setItem('taskmate-tasks', JSON.stringify({
              state: {
                tasks: data.tasks.tasks || [],
                questLog: data.tasks.questLog || [],
              },
              version: 0,
            }));
          }
          
          // Restore user
          if (data.user) {
            localStorage.setItem('taskmate-user', JSON.stringify({
              state: {
                user: data.user.user || data.user,
              },
              version: 0,
            }));
          }
          
          // Reload the page to refresh all stores
          window.dispatchEvent(
            new CustomEvent('show-notification', {
              detail: { 
                message: '✅ Data restored successfully! Reloading...', 
                type: 'success' 
              },
            })
          );
          
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          
          resolve();
        } else {
          resolve();
        }
      } catch (error) {
        console.error('Import failed:', error);
        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: { 
              message: '❌ Invalid backup file', 
              type: 'error' 
            },
          })
        );
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Auto-backup reminder
export const checkLastBackup = (): number => {
  const lastBackup = localStorage.getItem('taskmate-last-backup');
  if (!lastBackup) return 0;
  
  const daysSinceBackup = Math.floor(
    (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceBackup;
};

// Update last backup date
export const updateLastBackupDate = (): void => {
  localStorage.setItem('taskmate-last-backup', new Date().toISOString());
};

// Get data statistics
export const getDataStats = () => {
  const tasks = JSON.parse(localStorage.getItem('taskmate-tasks') || '{}');
  const user = JSON.parse(localStorage.getItem('taskmate-user') || '{}');
  
  const taskList = tasks.state?.tasks || [];
  const userData = user.state?.user;
  
  return {
    totalTasks: taskList.length,
    completedTasks: taskList.filter((t: any) => t.status === 'completed').length,
    activeTasks: taskList.filter((t: any) => t.status === 'active').length,
    storageSize: new Blob([JSON.stringify(localStorage)]).size,
    lastBackup: localStorage.getItem('taskmate-last-backup'),
    characterLevel: userData?.level || 0,
    totalGold: userData?.gold || 0,
  };
};

// Clear all data
export const clearAllData = (): void => {
  if (confirm('⚠️ Are you sure you want to delete ALL data? This cannot be undone!')) {
    if (confirm('🗑️ Final warning: All your quests, progress, and gold will be lost forever!')) {
      localStorage.removeItem('taskmate-tasks');
      localStorage.removeItem('taskmate-user');
      localStorage.removeItem('taskmate-last-backup');
      window.location.reload();
    }
  }
};