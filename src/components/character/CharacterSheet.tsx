import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../stores/useUserStore';
import { StatAllocation } from './StatAllocation';
import { CLASS_CONFIGS, getStatIcon, getStatColor } from '../../utils/classStats';

export const CharacterSheet: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const getLevelProgress = useUserStore((state) => state.getLevelProgress);
  const getXPToNextLevel = useUserStore((state) => state.getXPToNextLevel);
  const resetCharacter = useUserStore((state) => state.resetCharacter);
  const [showStatAllocation, setShowStatAllocation] = useState(false);

  if (!user) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400 text-center">
          No character created yet
        </p>
      </div>
    );
  }

  const progress = Math.min(getLevelProgress(), 100);
  const xpToNext = getXPToNextLevel();
  const classConfig = CLASS_CONFIGS[user.class];
  
  const gold = user.gold ?? 0;
  const totalXP = user.totalXP ?? 0;
  const level = user.level ?? 1;
  const questsCompleted = user.questsCompleted ?? 0;
  const questsFailed = user.questsFailed ?? 0;
  const currentStreak = user.streaks?.currentStreak ?? 0;
  const stats = user.stats ?? { strength: 0, intelligence: 0, agility: 0, wisdom: 0 };
  const statPoints = user.statPoints ?? 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg 
                   border-2 border-amber-700/50 p-4 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Character Info */}
          <div className="flex items-center gap-4">
            <div className="text-5xl bg-gray-700/50 rounded-full p-3 relative">
              {classConfig.icon}
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">{user.name}</h3>
              <p className="text-amber-400 font-semibold text-sm">
                Level {level} {classConfig.name}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {user.title?.charAt(0).toUpperCase() + user.title?.slice(1)}
              </p>
            </div>
          </div>

          {/* Gold Display */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 
                         rounded-lg p-3 border border-yellow-500/30 min-w-[120px]">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <div>
                <div className="text-xs text-gray-400 font-semibold">Gold Coins</div>
                <div className="text-xl font-bold text-yellow-400">
                  {gold.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs text-gray-300 mb-1.5">
              <span className="font-semibold">Experience</span>
              <span>{totalXP.toLocaleString()} / {(totalXP + xpToNext).toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 border border-gray-600 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20" />
              </motion.div>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {xpToNext.toLocaleString()} XP to level {level + 1}
            </p>
          </div>

          {/* Stats with Allocation Button */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(stats).map(([stat, value]) => (
                <div key={stat} className="text-center bg-gray-700/50 rounded-lg p-2">
                  <div className="text-xs font-bold mb-1">
                    <span className={getStatColor(stat as keyof typeof stats)}>
                      {getStatIcon(stat as keyof typeof stats)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-0.5">
                    {stat.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="text-lg font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
            
            {/* Stat Points Button */}
            {statPoints > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStatAllocation(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 
                         hover:from-purple-700 hover:to-blue-700
                         text-white font-bold py-2 px-4 rounded-lg text-sm
                         shadow-lg animate-pulse"
              >
                ⭐ {statPoints} Stat Points Available!
              </motion.button>
            )}
          </div>

          {/* Quest Stats */}
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400">Completed</div>
              <div className="font-bold text-green-400 text-lg">{questsCompleted}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Failed</div>
              <div className="font-bold text-red-400 text-lg">{questsFailed}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Streak</div>
              <div className="font-bold text-yellow-400 text-lg">{currentStreak}🔥</div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your character? This cannot be undone!')) {
                resetCharacter();
              }
            }}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1"
          >
            Reset
          </button>
        </div>
      </motion.div>

      {/* Stat Allocation Modal */}
      <StatAllocation 
        isOpen={showStatAllocation} 
        onClose={() => setShowStatAllocation(false)} 
      />
    </>
  );
};