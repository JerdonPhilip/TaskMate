import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackupPreviewData {
  userName: string;
  userLevel: number;
  userGold: number;
  userClass?: string;
  taskCount: number;
  completedTasks: number;
  activeTasks: number;
  failedTasks: number;
  backupDate: string;
  totalXP?: number;
  questLogCount?: number;
}

interface BackupPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  backupData: BackupPreviewData | null;
  isRestoring?: boolean;
}

const CLASS_ICONS: Record<string, string> = {
  warrior: '⚔️',
  mage: '🔮',
  rogue: '🗡️',
  cleric: '✨',
};

export const BackupPreviewModal: React.FC<BackupPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  backupData,
  isRestoring = false,
}) => {
  if (!backupData) return null;

  const classIcon = CLASS_ICONS[backupData.userClass || 'warrior'] || '👤';
  const completionRate = backupData.taskCount > 0 
    ? Math.round((backupData.completedTasks / backupData.taskCount) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isRestoring) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 
                     border-amber-500/50 p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="text-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl mb-2"
              >
                📦
              </motion.div>
              <h2 className="text-xl font-bold text-yellow-400 mb-0.5">
                Restore Backup
              </h2>
              <p className="text-gray-400 text-xs">
                Review contents before restoring
              </p>
            </div>

            {/* Warning */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 mb-3">
              <div className="flex items-start gap-2">
                <span className="text-red-400 text-sm">⚠️</span>
                <div>
                  <p className="text-red-400 font-bold text-xs">Warning</p>
                  <p className="text-red-300 text-[10px] mt-0.5">
                    This will replace all current data. This cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Character Info */}
            <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{classIcon}</span>
                <div>
                  <div className="text-white font-bold text-sm">{backupData.userName}</div>
                  <div className="text-gray-400 text-xs">
                    {backupData.userClass?.charAt(0).toUpperCase() + backupData.userClass?.slice(1)} • 
                    Level {backupData.userLevel}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800 rounded-lg p-2 text-center">
                  <div className="text-yellow-400 font-bold text-sm">🪙 {backupData.userGold.toLocaleString()}</div>
                  <div className="text-gray-500 text-[9px]">Gold</div>
                </div>
                {backupData.totalXP !== undefined && (
                  <div className="bg-gray-800 rounded-lg p-2 text-center">
                    <div className="text-green-400 font-bold text-sm">⚡ {backupData.totalXP.toLocaleString()}</div>
                    <div className="text-gray-500 text-[9px]">XP</div>
                  </div>
                )}
                <div className="bg-gray-800 rounded-lg p-2 text-center">
                  <div className="text-blue-400 font-bold text-sm">📋 {backupData.taskCount}</div>
                  <div className="text-gray-500 text-[9px]">Quests</div>
                </div>
              </div>
            </div>

            {/* Quest Stats */}
            <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
              <h3 className="text-xs font-bold text-gray-300 mb-2">Quest Breakdown</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                  <span className="text-xs text-gray-400">✅ Completed</span>
                  <span className="text-green-400 font-bold text-sm">{backupData.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                  <span className="text-xs text-gray-400">⚔️ Active</span>
                  <span className="text-blue-400 font-bold text-sm">{backupData.activeTasks}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                  <span className="text-xs text-gray-400">💀 Failed</span>
                  <span className="text-red-400 font-bold text-sm">{backupData.failedTasks}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                  <span className="text-xs text-gray-400">📜 Logs</span>
                  <span className="text-purple-400 font-bold text-sm">{backupData.questLogCount || 0}</span>
                </div>
              </div>
              
              {/* Completion Progress */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Completion</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Backup Date */}
            <div className="bg-gray-700/30 rounded-lg p-2.5 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">📅 Backup Date</span>
                <span className="text-white font-semibold">{backupData.backupDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-400">🔒 Security</span>
                <span className="text-green-400 font-semibold text-[10px]">Encrypted</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={isRestoring}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 
                         disabled:cursor-not-allowed text-gray-300 font-bold py-2.5 
                         rounded-lg transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isRestoring}
                className="flex-[2] bg-gradient-to-r from-red-600 to-red-700 
                         hover:from-red-700 hover:to-red-800
                         disabled:from-gray-700 disabled:to-gray-700 
                         disabled:cursor-not-allowed text-white font-bold py-2.5 
                         rounded-lg transition-all shadow-lg text-xs
                         flex items-center justify-center gap-1.5"
              >
                {isRestoring ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⏳
                    </motion.span>
                    Restoring...
                  </>
                ) : (
                  <>
                    <span>🔄</span> Restore Backup
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-gray-500 text-center mt-2">
              Page will reload after restoring
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};