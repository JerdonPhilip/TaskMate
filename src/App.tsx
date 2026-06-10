import React, { useEffect, useState, useRef } from 'react';
import { KanbanBoard } from './components/board/KanbanBoard';
import { useProgression } from './hooks/useProgression';
import { useUserStore } from './stores/useUserStore';
import { CharacterClass } from './types/user';
import { motion, AnimatePresence } from 'framer-motion';
import { CLASS_CONFIGS } from './utils/classStats';
import { BackupPreviewModal } from './components/layout/BackupPreviewModal';
import { useGoldSync } from './hooks/useGoldSync';

const CHARACTER_CLASSES = [
  { 
    value: 'warrior' as CharacterClass, 
    name: 'Warrior', 
    icon: '⚔️', 
    description: 'Strength & Endurance',
    details: '+3 STR, +2 AGI per level'
  },
  { 
    value: 'mage' as CharacterClass, 
    name: 'Mage', 
    icon: '🔮', 
    description: 'Intelligence & Magic',
    details: '+3 INT, +2 WIS per level'
  },
  { 
    value: 'rogue' as CharacterClass, 
    name: 'Rogue', 
    icon: '🗡️', 
    description: 'Agility & Speed',
    details: '+3 AGI, +2 STR per level'
  },
  { 
    value: 'cleric' as CharacterClass, 
    name: 'Cleric', 
    icon: '✨', 
    description: 'Wisdom & Healing',
    details: '+3 WIS, +2 INT per level'
  },
];

function App() {
  useProgression();
  const user = useUserStore((state) => state.user);
  useGoldSync();
  const initializeUser = useUserStore((state) => state.initializeUser);
  const resetCharacter = useUserStore((state) => state.resetCharacter);
  
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Import states
  const [showImportSection, setShowImportSection] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup preview modal states
  const [showBackupPreview, setShowBackupPreview] = useState(false);
  const [backupPreviewData, setBackupPreviewData] = useState<any>(null);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('taskmate-user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed?.state?.user) {
          let needsUpdate = false;
          
          if (parsed.state.user.gold === undefined) {
            parsed.state.user.gold = 0;
            needsUpdate = true;
          }
          
          if (parsed.state.user.statPoints === undefined) {
            parsed.state.user.statPoints = 0;
            needsUpdate = true;
          }
          
          if (parsed.state.user.streaks === undefined) {
            parsed.state.user.streaks = {
              currentStreak: 0,
              longestStreak: 0,
            };
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            localStorage.setItem('taskmate-user', JSON.stringify(parsed));
            window.location.reload();
            return;
          }
        }
        setHasExistingData(true);
      } catch (e) {
        localStorage.removeItem('taskmate-user');
        localStorage.removeItem('taskmate-tasks');
      }
    }

    const taskData = localStorage.getItem('taskmate-tasks');
    if (taskData) {
      try {
        const parsed = JSON.parse(taskData);
        if (parsed?.state?.tasks) {
          let needsUpdate = false;
          
          parsed.state.tasks = parsed.state.tasks.map((task: any) => {
            const updated = { ...task };
            
            if (updated.goldReward === undefined) {
              const goldMap: Record<string, number> = {
                trivial: 1, easy: 5, medium: 15, hard: 35, epic: 75
              };
              updated.goldReward = goldMap[updated.difficulty] || 5;
              needsUpdate = true;
            }
            
            if (updated.tags === undefined) {
              updated.tags = [];
              needsUpdate = true;
            }
            
            return updated;
          });
          
          if (needsUpdate) {
            localStorage.setItem('taskmate-tasks', JSON.stringify(parsed));
          }
        }
      } catch (e) {
        console.error('Error fixing task data:', e);
      }
    }

    const timer = setTimeout(() => {
      setLoading(false);
      if (!user && !hasExistingData) {
        setShowCharacterCreation(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user && !hasExistingData) {
      setShowCharacterCreation(true);
    } else if (user) {
      setShowCharacterCreation(false);
    }
  }, [user, loading, hasExistingData]);

  const handleCreateCharacter = () => {
    if (characterName.trim() && characterName.length >= 2) {
      initializeUser(characterName.trim(), selectedClass);
      setShowCharacterCreation(false);
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setImportError('Please select a valid JSON backup file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImportError('File size must be less than 10MB');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!data.version || !data.tasks || !data.user) {
          throw new Error('Invalid backup file format');
        }

        if (!data.tasks.tasks || !Array.isArray(data.tasks.tasks)) {
          throw new Error('Invalid tasks data');
        }

        const userData = data.user.user || data.user;
        const tasksData = data.tasks.tasks || [];
        
        const previewData = {
          userName: userData.name || 'Unknown Hero',
          userLevel: userData.level || 1,
          userGold: userData.gold || 0,
          userClass: userData.class || 'warrior',
          taskCount: tasksData.length,
          completedTasks: tasksData.filter((t: any) => t.status === 'completed').length,
          activeTasks: tasksData.filter((t: any) => t.status === 'active').length,
          failedTasks: tasksData.filter((t: any) => t.status === 'failed').length,
          backupDate: new Date(data.timestamp).toLocaleString(),
          totalXP: userData.totalXP || 0,
          questLogCount: data.tasks.questLog?.length || 0,
        };

        setPendingRestoreData(data);
        setBackupPreviewData(previewData);
        setShowBackupPreview(true);
        setIsImporting(false);
        
      } catch (error: any) {
        setImportError(error.message || 'Failed to parse backup file');
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      setImportError('Failed to read file. Please try again.');
      setIsImporting(false);
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmRestore = () => {
    if (!pendingRestoreData) return;
    
    setIsRestoring(true);
    
    try {
      const data = pendingRestoreData;
      
      localStorage.setItem('taskmate-tasks', JSON.stringify({
        state: {
          tasks: data.tasks.tasks || [],
          questLog: data.tasks.questLog || [],
        },
        version: 0,
      }));
      
      const userToRestore = data.user.user || data.user;
      localStorage.setItem('taskmate-user', JSON.stringify({
        state: {
          user: {
            ...userToRestore,
            gold: userToRestore.gold ?? 0,
            statPoints: userToRestore.statPoints ?? 0,
            streaks: userToRestore.streaks ?? { currentStreak: 0, longestStreak: 0 },
            stats: userToRestore.stats ?? { strength: 5, intelligence: 5, agility: 5, wisdom: 5 },
            questsCompleted: userToRestore.questsCompleted ?? 0,
            questsFailed: userToRestore.questsFailed ?? 0,
          },
        },
        version: 0,
      }));
      
      localStorage.setItem('taskmate-last-backup', new Date().toISOString());
      
      setTimeout(() => {
        setShowBackupPreview(false);
        setPendingRestoreData(null);
        setBackupPreviewData(null);
        setIsRestoring(false);
        
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, 300);
      
    } catch (error) {
      setImportError('Failed to restore backup');
      setIsRestoring(false);
      setShowBackupPreview(false);
    }
  };

  const handleCloseBackupPreview = () => {
    if (!isRestoring) {
      setShowBackupPreview(false);
      setPendingRestoreData(null);
      setBackupPreviewData(null);
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ⚔️
        </motion.div>
      </div>
    );
  }

  // Character Creation Screen
  if (showCharacterCreation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 
                   border-amber-500/50 p-6 max-w-2xl w-full shadow-2xl max-h-[95vh] overflow-y-auto"
        >
          {/* Header - Compact */}
          <div className="text-center mb-5">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-2 inline-block"
            >
              ⚔️
            </motion.div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-1">
              TaskMate
            </h1>
            <p className="text-gray-400 text-sm">
              RPG Quest Log • Create or restore your adventure
            </p>
          </div>

          {/* Import Section - Compact */}
          <div className="mb-5">
            <button
              onClick={() => setShowImportSection(!showImportSection)}
              className="w-full flex items-center justify-between bg-gray-700/50 
                       hover:bg-gray-700 rounded-lg p-3 border border-gray-600 
                       transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">📂</span>
                <div className="text-left">
                  <div className="text-white font-bold text-xs">
                    Have a backup file?
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    Click to restore your progress
                  </div>
                </div>
              </div>
              <motion.span
                animate={{ rotate: showImportSection ? 180 : 0 }}
                className="text-gray-400 text-lg"
              >
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {showImportSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-700/30 rounded-b-lg p-3 border border-t-0 border-gray-600">
                    <div className="mb-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                        id="import-file-input"
                      />
                      <label
                        htmlFor="import-file-input"
                        className={`
                          w-full flex items-center justify-center gap-2
                          px-3 py-2 rounded-lg font-bold text-xs cursor-pointer
                          transition-all border-2 border-dashed
                          ${isImporting 
                            ? 'bg-gray-700 border-gray-500 text-gray-400 cursor-wait' 
                            : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50 text-blue-400'
                          }
                        `}
                      >
                        {isImporting ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              ⏳
                            </motion.span>
                            Reading backup...
                          </>
                        ) : (
                          <>
                            <span>📁</span>
                            Select .json backup file
                          </>
                        )}
                      </label>
                    </div>

                    {importError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 mb-2"
                      >
                        <p className="text-red-400 text-xs">❌ {importError}</p>
                      </motion.div>
                    )}

                    {importSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 mb-2"
                      >
                        <p className="text-green-400 text-xs">{importSuccess}</p>
                      </motion.div>
                    )}

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                      <p className="text-blue-400 text-[10px]">
                        💡 Backup files are .json files exported from TaskMate
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider - Compact */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-gray-800 text-gray-400 font-semibold">
                OR CREATE NEW CHARACTER
              </span>
            </div>
          </div>

          {/* Form - Compact Spacing */}
          <div className="space-y-4">
            {/* Character Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                Character Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter your adventurer name..."
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-3 py-2 
                         text-white placeholder-gray-400 font-medium
                         focus:border-amber-500 outline-none transition-all text-sm"
                maxLength={20}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && characterName.trim().length >= 2) {
                    handleCreateCharacter();
                  }
                }}
              />
              <div className="flex justify-between mt-1">
                <p className="text-gray-500 text-[10px]">Min 2 characters</p>
                <span className={`text-[10px] ${characterName.length > 18 ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {characterName.length}/20
                </span>
              </div>
            </div>

            {/* Class Selection - Compact */}
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-2">
                Choose Your Class
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CHARACTER_CLASSES.map((charClass) => {
                  const config = CLASS_CONFIGS[charClass.value];
                  const isSelected = selectedClass === charClass.value;
                  
                  return (
                    <motion.button
                      key={charClass.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedClass(charClass.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all relative overflow-hidden
                        ${isSelected
                          ? 'border-amber-500 bg-gray-700 shadow-lg shadow-amber-500/20'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <span className="text-amber-400 text-sm">✓</span>
                        </div>
                      )}
                      
                      <div className="flex items-end gap-2">
                        <span className="text-2xl">{charClass.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-xs mb-0.5 truncate">
                            {charClass.name}
                          </h3>
                          <p className="text-[10px] text-gray-400 truncate">
                            {charClass.description}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {charClass.details}
                          </p>
                          
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-1.5 pt-1.5 border-t border-gray-600"
                            >
                              <div className="grid grid-cols-4 gap-1 text-center">
                                <div>
                                  <div className="text-[9px] text-red-400 font-bold">STR</div>
                                  <div className="text-white font-bold text-xs">{config.baseStats.strength}</div>
                                </div>
                                <div>
                                  <div className="text-[9px] text-blue-400 font-bold">INT</div>
                                  <div className="text-white font-bold text-xs">{config.baseStats.intelligence}</div>
                                </div>
                                <div>
                                  <div className="text-[9px] text-green-400 font-bold">AGI</div>
                                  <div className="text-white font-bold text-xs">{config.baseStats.agility}</div>
                                </div>
                                <div>
                                  <div className="text-[9px] text-purple-400 font-bold">WIS</div>
                                  <div className="text-white font-bold text-xs">{config.baseStats.wisdom}</div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Create Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateCharacter}
              disabled={!characterName.trim() || characterName.length < 2}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 
                       hover:from-amber-700 hover:to-amber-800
                       disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed 
                       text-white font-bold py-2.5 rounded-lg transition-all shadow-lg 
                       border border-amber-400 text-sm flex items-center justify-center gap-2"
            >
              <span>🗡️</span> Begin Adventure
            </motion.button>

            {hasExistingData && (
              <div className="text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                >
                  Try loading existing data
                </button>
              </div>
            )}
          </div>

          {/* Footer - Compact */}
          <div className="mt-4 pt-3 border-t border-gray-700 text-center">
            <p className="text-[10px] text-gray-600">
              💡 Auto-saves to browser • Use 💾 button for backups
            </p>
          </div>
        </motion.div>

        {/* Backup Preview Modal */}
        <BackupPreviewModal
          isOpen={showBackupPreview}
          onClose={handleCloseBackupPreview}
          onConfirm={handleConfirmRestore}
          backupData={backupPreviewData}
          isRestoring={isRestoring}
        />
      </div>
    );
  }

  // Main Application
  return (
    <div className="min-h-screen bg-gray-900">
      <KanbanBoard />
    </div>
  );
}

export default App;