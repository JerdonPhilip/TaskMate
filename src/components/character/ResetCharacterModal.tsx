import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../stores/useUserStore';
import { useTaskStore } from '../../stores/useTaskStore';

interface ResetCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetCharacterModal: React.FC<ResetCharacterModalProps> = ({ isOpen, onClose }) => {
  const user = useUserStore((state) => state.user);
  const resetCharacter = useUserStore((state) => state.resetCharacter);
  const tasks = useTaskStore((state) => state.tasks);
  const clearAllTasks = useTaskStore((state) => state.clearAllTasks);
  
  const [step, setStep] = useState(1);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleReset = () => {
    setIsResetting(true);
    
    try {
      // Clear all task data from store
      if (clearAllTasks) {
        clearAllTasks();
      }
      
      // Clear all localStorage data
      const keysToRemove = [
        'taskmate-user',
        'taskmate-tasks',
        'taskmate-dungeon',
        'taskmate-last-backup',
        'taskmate-deepseek-api-key',
        'taskmate-backup-reminder',
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error(`Failed to remove ${key}:`, e);
        }
      });
      
      // Reset user store
      resetCharacter();
      
      // Small delay for animation
      setTimeout(() => {
        setIsResetting(false);
        setStep(1);
        setConfirmText('');
        onClose();
        
        // Force reload to clear everything and show start screen
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Reset failed:', error);
      setIsResetting(false);
      // Force reload anyway
      window.location.reload();
    }
  };

  const handleClose = () => {
    if (!isResetting) {
      setStep(1);
      setConfirmText('');
      onClose();
    }
  };

  if (!user) return null;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const activeTasks = tasks.filter(t => t.status === 'active').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;
  const totalQuests = tasks.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isResetting) handleClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 
                     border-red-500/50 p-6 max-w-md w-full shadow-2xl"
          >
            {step === 1 ? (
              /* Step 1: Warning Screen */
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl mb-3"
                  >
                    ⚠️
                  </motion.div>
                  <h2 className="text-2xl font-bold text-red-400 mb-1">
                    Reset Character?
                  </h2>
                  <p className="text-gray-400 text-sm">
                    This action cannot be undone!
                  </p>
                </div>

                {/* Character Info */}
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4 border border-gray-600">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">
                      {user.class === 'warrior' ? '⚔️' : 
                       user.class === 'mage' ? '🔮' : 
                       user.class === 'rogue' ? '🗡️' : '✨'}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{user.name}</h3>
                      <p className="text-gray-400 text-sm">
                        Level {user.level} {user.class.charAt(0).toUpperCase() + user.class.slice(1)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {user.title?.charAt(0).toUpperCase() + user.title?.slice(1)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-gray-800 rounded p-2 text-center">
                      <div className="text-gray-400 text-xs">Gold</div>
                      <div className="text-yellow-400 font-bold">
                        🪙 {user.gold?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-2 text-center">
                      <div className="text-gray-400 text-xs">XP</div>
                      <div className="text-green-400 font-bold">
                        ⚡ {user.totalXP?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-2 text-center">
                      <div className="text-gray-400 text-xs">Stats</div>
                      <div className="text-purple-400 font-bold">
                        {user.statPoints || 0} pts
                      </div>
                    </div>
                  </div>
                </div>

                {/* What will be lost */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <h3 className="text-red-400 font-bold text-sm mb-2">
                    🗑️ The following will be permanently deleted:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>
                        <strong>{user.name}</strong> - Level {user.level} {user.class}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>
                        All gold coins (<strong className="text-yellow-400">{user.gold?.toLocaleString() || 0} 🪙</strong>)
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>
                        All stats (STR: {user.stats?.strength}, INT: {user.stats?.intelligence}, AGI: {user.stats?.agility}, WIS: {user.stats?.wisdom})
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>
                        All quests (<strong>{totalQuests}</strong> total: {completedTasks} completed, {activeTasks} active, {failedTasks} failed)
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>Quest history and quest log entries</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>Achievements and streaks ({user.streaks?.currentStreak || 0} day streak)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>Dungeon exploration history</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>API keys and settings</span>
                    </li>
                  </ul>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-yellow-400 text-xs text-center">
                    ⚠️ Make sure to <strong>export a backup</strong> from the 💾 menu if you want to keep your data!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 
                             font-bold py-3 rounded-lg transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-[2] bg-gradient-to-r from-red-600 to-red-700 
                             hover:from-red-700 hover:to-red-800
                             text-white font-bold py-3 rounded-lg transition-all 
                             shadow-lg text-sm"
                  >
                    Continue to Reset
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                  You will be redirected to create a new character
                </p>
              </>
            ) : (
              /* Step 2: Final Confirmation */
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-5xl mb-3"
                  >
                    💀
                  </motion.div>
                  <h2 className="text-2xl font-bold text-red-400 mb-1">
                    Final Confirmation
                  </h2>
                  <p className="text-gray-400 text-sm">
                    This is your absolute last chance!
                  </p>
                </div>

                {/* Character Summary */}
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4 border border-gray-600">
                  <h3 className="text-sm font-bold text-gray-300 mb-3">
                    Saying goodbye to:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Character</span>
                      <span className="text-white font-bold">{user.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Level</span>
                      <span className="text-yellow-400 font-bold">{user.level}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Class</span>
                      <span className="text-white font-bold">
                        {user.class.charAt(0).toUpperCase() + user.class.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total XP</span>
                      <span className="text-green-400 font-bold">{user.totalXP?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Gold</span>
                      <span className="text-yellow-400 font-bold">{user.gold?.toLocaleString() || 0} 🪙</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Quests</span>
                      <span className="text-white font-bold">{totalQuests} total</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Completed</span>
                      <span className="text-green-400 font-bold">{completedTasks}</span>
                    </div>
                  </div>
                </div>

                {/* Type to confirm */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-400 mb-2">
                    Type <span className="text-red-400 font-bold text-lg">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE here..."
                    className="w-full bg-gray-700 border-2 rounded-lg px-4 py-2.5 
                             text-white placeholder-gray-400 font-bold text-center text-lg
                             tracking-widest
                             focus:border-red-500 outline-none transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed
                             uppercase"
                    disabled={isResetting}
                    autoFocus
                    spellCheck={false}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && confirmText === 'DELETE' || confirmText === 'delete' || confirmText === 'Delete' && !isResetting) {
                        handleReset();
                      }
                    }}
                  />
                  {confirmText.length > 0 && confirmText !== 'DELETE' && (
                    <p className="text-yellow-400 text-xs mt-1 text-center">
                      Type exactly "DELETE" to enable the button
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    disabled={isResetting}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 
                             disabled:cursor-not-allowed text-gray-300 
                             font-bold py-3 rounded-lg transition-all text-sm"
                  >
                    ← Go Back
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={confirmText !== 'DELETE' || isResetting}
                    className="flex-[2] bg-gradient-to-r from-red-700 to-red-800 
                             hover:from-red-800 hover:to-red-900
                             disabled:from-gray-700 disabled:to-gray-700 
                             disabled:cursor-not-allowed text-white font-bold py-3 
                             rounded-lg transition-all shadow-lg text-sm
                             flex items-center justify-center gap-2"
                  >
                    {isResetting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="text-lg"
                        >
                          ⏳
                        </motion.span>
                        Destroying Character...
                      </>
                    ) : (
                      <>
                        <span>💀</span> Delete Forever
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                  {isResetting 
                    ? 'Clearing all data and redirecting...' 
                    : 'Page will reload after reset'}
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};