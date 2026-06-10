import { encryptObject, decryptObject, isEncrypted } from './encryption';
import { enableEncryption } from './secureStorage';

interface BackupData {
  version: string;
  timestamp: string;
  tasks: any;
  user: any;
  questLog: any;
  inventory?: any;
  dungeon?: any;
  checksum?: string;
}

interface DataStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  storageSize: number;
  lastBackup: string | null;
  characterLevel: number;
  totalGold: number;
}

// Helper to safely get and parse localStorage data
const getStoreData = (key: string): any => {
  const rawData = localStorage.getItem(key);
  if (!rawData) return {};
  
  try {
    // Check if encrypted
    if (isEncrypted(rawData)) {
      const decrypted = decryptObject(rawData);
      if (decrypted) return decrypted;
    }
    
    // Try parsing as JSON
    return JSON.parse(rawData);
  } catch {
    return {};
  }
};

// Export data to encrypted JSON file
export const exportData = (): void => {
  try {
    const tasksData = getStoreData('taskmate-tasks');
    const userData = getStoreData('taskmate-user');
    const inventoryData = getStoreData('taskmate-inventory');
    const dungeonData = getStoreData('taskmate-dungeon');
    
    // Extract the actual state data
    const tasks = tasksData.state || tasksData;
    const user = userData.state || userData;
    const inventory = inventoryData.state || inventoryData;
    const dungeon = dungeonData.state || dungeonData;
    
    const backupData: BackupData = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      tasks: {
        tasks: Array.isArray(tasks.tasks) ? tasks.tasks : [],
        questLog: Array.isArray(tasks.questLog) ? tasks.questLog : [],
      },
      user: {
        user: user.user || user,
      },
      questLog: Array.isArray(tasks.questLog) ? tasks.questLog : [],
      inventory: inventory,
      dungeon: dungeon,
    };

    // Encrypt the backup data
    const encrypted = encryptObject(backupData);
    
    // Create downloadable file
    const blob = new Blob([encrypted], { 
      type: 'application/octet-stream' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskmate-backup-${new Date().toISOString().split('T')[0]}.tmenc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Update last backup date
    localStorage.setItem('taskmate-last-backup', new Date().toISOString());
    
    window.dispatchEvent(
      new CustomEvent('show-notification', {
        detail: { 
          message: '✅ Encrypted backup exported successfully!', 
          type: 'success' 
        },
      })
    );
  } catch (error) {
    console.error('Export failed:', error);
    window.dispatchEvent(
      new CustomEvent('show-notification', {
        detail: { 
          message: '❌ Failed to export data. Try again.', 
          type: 'error' 
        },
      })
    );
  }
};

// Import encrypted backup file
export const importData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: BackupData;

        // Try to decrypt first (for .tmenc files)
        try {
          const decrypted = decryptObject(content);
          if (decrypted) {
            data = decrypted;
          } else {
            // Try plain JSON (for old .json backups)
            data = JSON.parse(content);
          }
        } catch {
          // Try plain JSON
          data = JSON.parse(content);
        }
        
        // Validate backup data
        if (!data.version || !data.tasks || !data.user) {
          throw new Error('Invalid backup file format');
        }

        // Restore from the data
        restoreFromBackup(data);
        resolve();
      } catch (error) {
        console.error('Import failed:', error);
        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: { 
              message: '❌ Invalid or corrupted backup file', 
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

// Restore from backup data
export const restoreFromBackup = (data: BackupData): void => {
  try {
    // Restore tasks
    const tasksToSave = {
      state: {
        tasks: Array.isArray(data.tasks.tasks) ? data.tasks.tasks : [],
        questLog: Array.isArray(data.tasks.questLog) ? data.tasks.questLog : (Array.isArray(data.questLog) ? data.questLog : []),
      },
      version: 0,
    };
    localStorage.setItem('taskmate-tasks', JSON.stringify(tasksToSave));
    
    // Restore user
    const userData = data.user.user || data.user;
    const userToSave = {
      state: {
        user: {
          ...userData,
          gold: userData.gold ?? 0,
          statPoints: userData.statPoints ?? 0,
          streaks: userData.streaks ?? { currentStreak: 0, longestStreak: 0 },
          stats: userData.stats ?? { strength: 5, intelligence: 5, agility: 5, wisdom: 5 },
          currentHP: userData.currentHP ?? userData.maxHP ?? 100,
          maxHP: userData.maxHP ?? 100,
          currentMana: userData.currentMana ?? userData.maxMana ?? 100,
          maxMana: userData.maxMana ?? 100,
          questsCompleted: userData.questsCompleted ?? 0,
          questsFailed: userData.questsFailed ?? 0,
        },
      },
      version: 0,
    };
    localStorage.setItem('taskmate-user', JSON.stringify(userToSave));
    
    // Restore inventory if available
    if (data.inventory) {
      localStorage.setItem('taskmate-inventory', JSON.stringify({
        state: data.inventory,
        version: 0,
      }));
    }
    
    // Restore dungeon if available
    if (data.dungeon) {
      localStorage.setItem('taskmate-dungeon', JSON.stringify({
        state: data.dungeon,
        version: 0,
      }));
    }
    
    // Update last backup date
    localStorage.setItem('taskmate-last-backup', new Date().toISOString());
    
    window.dispatchEvent(
      new CustomEvent('show-notification', {
        detail: { 
          message: '✅ Backup restored! Reloading...', 
          type: 'success' 
        },
      })
    );
    
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error('Restore failed:', error);
    window.dispatchEvent(
      new CustomEvent('show-notification', {
        detail: { 
          message: '❌ Failed to restore backup', 
          type: 'error' 
        },
      })
    );
  }
};

// Check days since last backup
export const checkLastBackup = (): number => {
  const lastBackup = localStorage.getItem('taskmate-last-backup');
  if (!lastBackup) return 0;
  
  try {
    const daysSinceBackup = Math.floor(
      (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, daysSinceBackup);
  } catch {
    return 0;
  }
};

// Update last backup date
export const updateLastBackupDate = (): void => {
  localStorage.setItem('taskmate-last-backup', new Date().toISOString());
};

// Get data statistics
export const getDataStats = (): DataStats => {
  try {
    const tasksData = getStoreData('taskmate-tasks');
    const userData = getStoreData('taskmate-user');
    const inventoryData = getStoreData('taskmate-inventory');
    
    const tasks = tasksData.state || tasksData;
    const user = userData.state || userData;
    const inventory = inventoryData.state || inventoryData;
    
    const taskList = Array.isArray(tasks.tasks) ? tasks.tasks : [];
    const userObj = user.user || user;
    
    // Calculate storage size
    let totalSize = 0;
    const keys = [
      'taskmate-tasks', 'taskmate-user', 'taskmate-inventory', 
      'taskmate-dungeon', 'taskmate-last-backup', 'taskmate-backup-reminder'
    ];
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) totalSize += data.length * 2;
    });
    
    return {
      totalTasks: taskList.length,
      completedTasks: taskList.filter((t: any) => t.status === 'completed').length,
      activeTasks: taskList.filter((t: any) => t.status === 'active').length,
      storageSize: totalSize,
      lastBackup: localStorage.getItem('taskmate-last-backup'),
      characterLevel: userObj?.level || 0,
      totalGold: userObj?.gold || inventory?.gold || 0,
    };
  } catch {
    return {
      totalTasks: 0,
      completedTasks: 0,
      activeTasks: 0,
      storageSize: 0,
      lastBackup: null,
      characterLevel: 0,
      totalGold: 0,
    };
  }
};

// Clear all data
export const clearAllData = (): void => {
  if (confirm('⚠️ Are you sure you want to delete ALL data? This cannot be undone!')) {
    if (confirm('🗑️ Final warning: All your quests, progress, and gold will be lost forever!')) {
      const keys = [
        'taskmate-tasks',
        'taskmate-user', 
        'taskmate-inventory',
        'taskmate-dungeon',
        'taskmate-last-backup',
        'taskmate-backup-reminder',
        'taskmate-deepseek-api-key',
        'taskmate-encryption-enabled',
      ];
      
      keys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error(`Failed to remove ${key}:`, e);
        }
      });
      
      window.dispatchEvent(
        new CustomEvent('show-notification', {
          detail: { 
            message: '🗑️ All data cleared! Reloading...', 
            type: 'info' 
          },
        })
      );
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
};

// Migrate existing localStorage to encrypted
export const migrateToEncryptedStorage = (): void => {
  const keys = ['taskmate-tasks', 'taskmate-user', 'taskmate-inventory', 'taskmate-dungeon'];
  
  let migratedCount = 0;
  
  // Enable encryption
  enableEncryption();
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (!data) return;
    
    try {
      // Check if already encrypted
      if (isEncrypted(data)) {
        console.log(`ℹ️ ${key} is already encrypted`);
        return;
      }
      
      // Parse the data
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        console.log(`⚠️ ${key} has invalid format, skipping`);
        return;
      }
      
      // Encrypt and save
      const encrypted = encryptObject(parsed);
      localStorage.setItem(key, encrypted);
      migratedCount++;
      console.log(`✅ Migrated ${key} to encrypted storage`);
    } catch (e) {
      console.error(`Failed to migrate ${key}:`, e);
    }
  });
  
  if (migratedCount > 0) {
    window.dispatchEvent(
      new CustomEvent('show-notification', {
        detail: { 
          message: `✅ ${migratedCount} data stores encrypted!`, 
          type: 'success' 
        },
      })
    );
  } else {
    window.dispatchEvent(
      new CustomEvent('show-notification', {
        detail: { 
          message: 'ℹ️ All data is already encrypted', 
          type: 'info' 
        },
      })
    );
  }
};