import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkLastBackup } from '../../utils/dataManager';

interface BackupReminderProps {
  onBackupClick: () => void;
}

export const BackupReminder: React.FC<BackupReminderProps> = ({ onBackupClick }) => {
  const [showReminder, setShowReminder] = useState(false);
  const [daysSinceBackup, setDaysSinceBackup] = useState(0);

  useEffect(() => {
    const checkBackup = () => {
      const reminderEnabled = localStorage.getItem('taskmate-backup-reminder') !== 'false';
      if (!reminderEnabled) return;

      const days = checkLastBackup();
      setDaysSinceBackup(days);
      
      // Show reminder after 3 days without backup
      if (days >= 3) {
        setShowReminder(true);
      }
    };

    checkBackup();
    // Check every hour
    const interval = setInterval(checkBackup, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {showReminder && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 z-50"
        >
          <div className={`p-4 rounded-lg shadow-2xl border ${
            daysSinceBackup > 7 
              ? 'bg-red-900/90 border-red-500' 
              : 'bg-yellow-900/90 border-yellow-500'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {daysSinceBackup > 7 ? '⚠️' : '💡'}
              </span>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">
                  {daysSinceBackup > 7 
                    ? 'Critical: Backup Your Data!' 
                    : 'Time for a Backup?'}
                </h4>
                <p className="text-gray-300 text-xs mb-2">
                  {daysSinceBackup > 7 
                    ? `Last backup was ${daysSinceBackup} days ago. You might lose progress!`
                    : `It's been ${daysSinceBackup} days since your last backup.`
                  }
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onBackupClick();
                      setShowReminder(false);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs 
                             font-bold py-1 px-3 rounded transition-colors"
                  >
                    Backup Now
                  </button>
                  <button
                    onClick={() => setShowReminder(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 
                             text-xs py-1 px-3 rounded transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};