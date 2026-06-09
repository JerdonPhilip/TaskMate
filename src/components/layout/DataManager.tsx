import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportData, importData, checkLastBackup, getDataStats, clearAllData } from '../../utils/dataManager';

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState(getDataStats());
  const [daysSinceBackup, setDaysSinceBackup] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStats(getDataStats());
      setDaysSinceBackup(checkLastBackup());
    }
  }, [isOpen]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importData(file);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    exportData();
    setDaysSinceBackup(0);
    setStats(getDataStats());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 
                     border-amber-500/50 p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                  💾 Data Management
                </h2>
                <p className="text-gray-400 text-sm mt-1">Backup & restore your progress</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Backup Status */}
            {daysSinceBackup > 0 && (
              <div className={`p-3 rounded-lg mb-4 ${
                daysSinceBackup > 7 ? 'bg-red-500/20 border border-red-500/50' :
                daysSinceBackup > 3 ? 'bg-yellow-500/20 border border-yellow-500/50' :
                'bg-blue-500/20 border border-blue-500/50'
              }`}>
                <p className="text-sm">
                  {daysSinceBackup > 7 
                    ? `⚠️ Last backup was ${daysSinceBackup} days ago! Create a backup now!`
                    : `ℹ️ Last backup was ${daysSinceBackup} day${daysSinceBackup > 1 ? 's' : ''} ago`
                  }
                </p>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-bold text-gray-300 mb-3">📊 Data Overview</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">Total Quests</div>
                  <div className="text-white font-bold">{stats.totalTasks}</div>
                </div>
                <div>
                  <div className="text-gray-400">Completed</div>
                  <div className="text-green-400 font-bold">{stats.completedTasks}</div>
                </div>
                <div>
                  <div className="text-gray-400">Character Level</div>
                  <div className="text-yellow-400 font-bold">{stats.characterLevel}</div>
                </div>
                <div>
                  <div className="text-gray-400">Total Gold</div>
                  <div className="text-yellow-400 font-bold">{stats.totalGold?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Storage Used</div>
                  <div className="text-white font-bold">
                    {(stats.storageSize / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Last Backup</div>
                  <div className="text-white font-bold text-xs">
                    {stats.lastBackup 
                      ? new Date(stats.lastBackup).toLocaleDateString()
                      : 'Never'}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <h4 className="text-blue-400 font-semibold text-sm mb-1">💡 Important Information</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Data is stored in your browser's localStorage</li>
                <li>• Clearing browser data will delete ALL progress</li>
                <li>• Data does NOT sync across devices</li>
                <li>• Create regular backups to prevent data loss</li>
                <li>• Backup files can be used to restore progress</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Export Button */}
              <button
                onClick={handleExport}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 
                         hover:from-green-700 hover:to-emerald-700
                         text-white font-bold py-3 px-4 rounded-lg
                         transition-all shadow-lg flex items-center justify-center gap-2"
              >
                📥 Export Backup File
              </button>

              {/* Import Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="backup-file-input"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 
                           hover:from-blue-700 hover:to-indigo-700
                           disabled:from-gray-700 disabled:to-gray-700
                           text-white font-bold py-3 px-4 rounded-lg
                           transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isImporting ? '⏳ Importing...' : '📤 Import Backup File'}
                </button>
              </div>

              {/* Auto-Backup Reminder Toggle */}
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">
                    ⏰ Remind me to backup every 7 days
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked={localStorage.getItem('taskmate-backup-reminder') !== 'false'}
                    onChange={(e) => {
                      localStorage.setItem('taskmate-backup-reminder', e.target.checked.toString());
                    }}
                    className="w-4 h-4 accent-amber-500"
                  />
                </label>
              </div>

              {/* Clear Data Button */}
              <button
                onClick={clearAllData}
                className="w-full bg-red-600/20 hover:bg-red-600/30 
                         text-red-400 font-bold py-3 px-4 rounded-lg
                         transition-all border border-red-500/30"
              >
                🗑️ Delete All Data
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-gray-300 
                       font-semibold py-2 rounded-lg transition-all"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};