import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../stores/useUserStore';
import { UserStats } from '../../types/user';
import { CLASS_CONFIGS, getStatDescription, getStatColor, getStatIcon } from '../../utils/classStats';

interface StatAllocationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatAllocation: React.FC<StatAllocationProps> = ({ isOpen, onClose }) => {
  const user = useUserStore((state) => state.user);
  const allocateStatPoint = useUserStore((state) => state.allocateStatPoint);
  const [allocatedStats, setAllocatedStats] = useState<Partial<UserStats>>({});
  const [previewStats, setPreviewStats] = useState<UserStats | null>(null);

  if (!user) return null;

  const classConfig = CLASS_CONFIGS[user.class];
  const remainingPoints = user.statPoints;

  const handleStatPreview = (stat: keyof UserStats) => {
    if (remainingPoints <= 0) return;
    
    const newAllocated = {
      ...allocatedStats,
      [stat]: (allocatedStats[stat] || 0) + 1,
    };
    setAllocatedStats(newAllocated);

    setPreviewStats({
      strength: user.stats.strength + (newAllocated.strength || 0),
      intelligence: user.stats.intelligence + (newAllocated.intelligence || 0),
      agility: user.stats.agility + (newAllocated.agility || 0),
      wisdom: user.stats.wisdom + (newAllocated.wisdom || 0),
    });
  };

  const handleConfirmAllocation = () => {
    // Apply all allocations
    Object.entries(allocatedStats).forEach(([stat, points]) => {
      for (let i = 0; i < (points || 0); i++) {
        allocateStatPoint(stat as keyof UserStats);
      }
    });
    
    // Reset local state
    setAllocatedStats({});
    setPreviewStats(null);
    onClose();
  };

  const handleReset = () => {
    setAllocatedStats({});
    setPreviewStats(null);
  };

  const currentStats = previewStats || user.stats;

  const statBars: { stat: keyof UserStats; label: string }[] = [
    { stat: 'strength', label: 'STR' },
    { stat: 'intelligence', label: 'INT' },
    { stat: 'agility', label: 'AGI' },
    { stat: 'wisdom', label: 'WIS' },
  ];

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
                     border-amber-500/50 p-6 max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{classConfig.icon}</div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                Allocate Stat Points
              </h2>
              <p className="text-gray-400 text-sm">
                Class: <span className="text-white font-semibold">{classConfig.name}</span>
              </p>
              <div className="mt-3 inline-block bg-amber-500/20 rounded-full px-4 py-2">
                <span className="text-amber-400 font-bold text-lg">
                  {remainingPoints - Object.values(allocatedStats).reduce((a, b) => a + (b || 0), 0)}
                </span>
                <span className="text-gray-400 text-sm ml-2">Points Remaining</span>
              </div>
            </div>

            {/* Class Info */}
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4 text-sm">
              <p className="text-gray-300">
                <span className="text-yellow-400 font-semibold">Primary:</span> {classConfig.primaryStat.toUpperCase()}
                <span className="mx-2">|</span>
                <span className="text-yellow-400 font-semibold">Secondary:</span> {classConfig.secondaryStat.toUpperCase()}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {classConfig.description}
              </p>
            </div>

            {/* Stat Bars */}
            <div className="space-y-4 mb-6">
              {statBars.map(({ stat, label }) => {
                const allocatedValue = allocatedStats[stat] || 0;
                const currentValue = currentStats[stat];
                const isPrimary = stat === classConfig.primaryStat;
                const isSecondary = stat === classConfig.secondaryStat;
                
                return (
                  <div key={stat}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getStatIcon(stat)}</span>
                        <span className={`font-bold ${getStatColor(stat)}`}>{label}</span>
                        {isPrimary && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                        {isSecondary && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            Secondary
                          </span>
                        )}
                      </div>
                      <span className="text-white font-bold">
                        {currentValue}
                        {allocatedValue > 0 && (
                          <span className="text-green-400 text-sm ml-1">
                            (+{allocatedValue})
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute h-full rounded-full transition-all duration-300 ${
                          stat === 'strength' ? 'bg-gradient-to-r from-red-600 to-red-400' :
                          stat === 'intelligence' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                          stat === 'agility' ? 'bg-gradient-to-r from-green-600 to-green-400' :
                          'bg-gradient-to-r from-purple-600 to-purple-400'
                        }`}
                        style={{ width: `${(currentValue / 50) * 100}%` }}
                      />
                    </div>

                    {/* Allocate Button */}
                    {remainingPoints - Object.values(allocatedStats).reduce((a, b) => a + (b || 0), 0) > 0 && (
                      <button
                        onClick={() => handleStatPreview(stat)}
                        className="mt-1 w-full text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 
                                 py-1 rounded transition-colors"
                      >
                        + Add Point to {label}
                      </button>
                    )}

                    <p className="text-xs text-gray-500 mt-1">{getStatDescription(stat)}</p>
                  </div>
                );
              })}
            </div>

            {/* Growth Preview */}
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-bold text-gray-300 mb-2">Per Level Growth (Auto)</h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <div className="text-red-400 font-bold">STR</div>
                  <div className="text-white">+{classConfig.statGrowthPerLevel.strength}</div>
                </div>
                <div>
                  <div className="text-blue-400 font-bold">INT</div>
                  <div className="text-white">+{classConfig.statGrowthPerLevel.intelligence}</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold">AGI</div>
                  <div className="text-white">+{classConfig.statGrowthPerLevel.agility}</div>
                </div>
                <div>
                  <div className="text-purple-400 font-bold">WIS</div>
                  <div className="text-white">+{classConfig.statGrowthPerLevel.wisdom}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAllocation}
                disabled={Object.values(allocatedStats).reduce((a, b) => a + (b || 0), 0) === 0}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 
                         hover:to-amber-800 disabled:from-gray-700 disabled:to-gray-700 
                         disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg 
                         transition-all shadow-lg"
              >
                ✅ Confirm ({Object.values(allocatedStats).reduce((a, b) => a + (b || 0), 0)} points)
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 
                         font-semibold rounded-lg transition-all"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 
                         font-semibold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};