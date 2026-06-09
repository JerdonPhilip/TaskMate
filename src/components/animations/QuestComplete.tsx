import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuestComplete: React.FC = () => {
  const [showComplete, setShowComplete] = useState(false);
  const [lastCompletedXP, setLastCompletedXP] = useState(0);
  const [lastCompletedGold, setLastCompletedGold] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  useEffect(() => {
    const handleTaskComplete = (event: CustomEvent) => {
      const { xpReward, goldReward } = event.detail;
      setLastCompletedXP(xpReward);
      setLastCompletedGold(goldReward);
      setShowComplete(true);
      
      setTimeout(() => {
        setShowComplete(false);
      }, 3000);
    };

    const handleLevelUp = (event: CustomEvent) => {
      const { newLevel } = event.detail;
      setNewLevel(newLevel);
      setShowLevelUp(true);
      
      setTimeout(() => {
        setShowLevelUp(false);
      }, 4000);
    };

    window.addEventListener('task-completed', handleTaskComplete as EventListener);
    window.addEventListener('level-up', handleLevelUp as EventListener);
    
    return () => {
      window.removeEventListener('task-completed', handleTaskComplete as EventListener);
      window.removeEventListener('level-up', handleLevelUp as EventListener);
    };
  }, []);

  return (
    <>
      {/* Quest Complete Animation */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.5 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 
                          border-yellow-500 rounded-lg p-5 shadow-2xl">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-4xl mb-3"
                >
                  ✨
                </motion.div>
                <h3 className="font-bold text-lg text-yellow-400 mb-3">
                  QUEST COMPLETED!
                </h3>
                <div className="flex gap-6 justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-sm font-bold text-green-400">
                      +{lastCompletedXP} XP
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🪙</div>
                    <div className="text-sm font-bold text-yellow-400">
                      +{lastCompletedGold} Gold
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.2, 1], rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center bg-gray-900/80 rounded-2xl p-8 border-2 border-yellow-500"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="font-bold text-5xl text-yellow-400 mb-3">
                LEVEL UP!
              </h2>
              <p className="text-2xl text-white font-semibold">
                You reached level {newLevel}!
              </p>
              <p className="text-gray-400 mt-2">
                +1 Stat Point Awarded
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};