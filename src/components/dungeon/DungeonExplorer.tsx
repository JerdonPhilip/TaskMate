import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDungeonStore } from '../../stores/useDungeonStore';
import { useUserStore } from '../../stores/useUserStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { DUNGEON_TYPES } from '../../utils/dungeonTypes';
import { DungeonScreen } from './DungeonScreen';

export const DungeonExplorer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const user = useUserStore((state) => state.user);

  const {
    isExploring,
    isGenerating,
    startExploration,
    getAvailableDungeons,
    getDungeonStats,
  } = useDungeonStore();

  const [selectedDungeon, setSelectedDungeon] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);
  const stats = getDungeonStats();

  const availableDungeons = getAvailableDungeons(user?.level || 1);

  const getEquippedStats = useInventoryStore((state) => state.getEquippedStats);

  const handleStartExploration = async () => {
    if (!selectedDungeon || !user) return;

    // Check if player has enough HP
    if (user.currentHP <= 0) {
      window.dispatchEvent(
        new CustomEvent('show-notification', {
          detail: {
            message: '💀 You have no HP! Visit the shop to heal before exploring.',
            type: 'error'
          },
        })
      );
      return;
    }

    // Check if player has enough Mana
    if (user.currentMana <= 0) {
      window.dispatchEvent(
        new CustomEvent('show-notification', {
          detail: {
            message: '💙 You have no Mana! Meditate or use potions before exploring.',
            type: 'warning'
          },
        })
      );
    }

    const baseStats = user.stats || { strength: 5, intelligence: 5, agility: 5, wisdom: 5 };
    const equippedStats = getEquippedStats();

    const totalStats = {
      strength: baseStats.strength + (equippedStats.strength || 0),
      intelligence: baseStats.intelligence + (equippedStats.intelligence || 0),
      agility: baseStats.agility + (equippedStats.agility || 0),
      wisdom: baseStats.wisdom + (equippedStats.wisdom || 0),
    };

    await startExploration(selectedDungeon, user.level, user.class, totalStats);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Show dungeon screen when exploring
  if (isExploring) {
    return <DungeonScreen onClose={ handleClose } />;
  }

  return (
    <motion.div
      initial={ { opacity: 0 } }
      animate={ { opacity: 1 } }
      exit={ { opacity: 0 } }
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={ (e) => {
        if (e.target === e.currentTarget) handleClose();
      } }
    >
      <motion.div
        initial={ { scale: 0.9, y: 20 } }
        animate={ { scale: 1, y: 0 } }
        exit={ { scale: 0.9, y: 20 } }
        className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 
                 border-amber-500/50 p-6 max-w-lg w-full shadow-2xl relative"
      >
        {/* Exit Button */ }
        <button
          onClick={ handleClose }
          disabled={ isClosing }
          className="absolute top-3 right-3 text-gray-400 hover:text-white 
                   transition-colors text-2xl hover:bg-gray-700/50 rounded-full 
                   w-10 h-10 flex items-center justify-center z-10
                   disabled:opacity-50 disabled:cursor-not-allowed"
          title="Exit Dungeon Explorer"
        >
          ✕
        </button>

        {/* Header */ }
        <div className="text-center mb-6 pr-10">
          <div className="text-5xl mb-3">🗺️</div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-1">Dungeon Explorer</h2>
          <p className="text-gray-400 text-sm">
            Adventure awaits in the dungeons below!
          </p>
          { user && (
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
              <span>Level { user.level } { user.class }</span>
              { stats.explored > 0 && (
                <>
                  <span>•</span>
                  <span>{ stats.explored } explored</span>
                  <span>•</span>
                  <span>{ stats.bosses } defeated</span>
                </>
              ) }
            </div>
          ) }
        </div>

        {/* Stats Bar */ }
        { stats.explored > 0 && (
          <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <div className="text-gray-400 text-xs">Explored</div>
                <div className="text-white font-bold">{ stats.explored }</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Defeated</div>
                <div className="text-green-400 font-bold">{ stats.bosses }</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Favorite</div>
                <div className="text-yellow-400 font-bold text-xs truncate">{ stats.favorite }</div>
              </div>
            </div>
          </div>
        ) }

        {/* Dungeon List */ }
        <div className="mb-6 max-h-[350px] overflow-y-auto
                      scrollbar-none
                      [&::-webkit-scrollbar]:hidden
                      [-ms-overflow-style:none]
                      [scrollbar-width:none]">
          <div className="space-y-2 pr-1">
            { availableDungeons.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No dungeons available yet.</p>
                <p className="text-gray-500 text-sm mt-1">
                  Reach level { DUNGEON_TYPES.reduce((min, d) => Math.min(min, d.minLevel), 99) } to unlock!
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  Complete quests to level up faster!
                </p>
              </div>
            ) : (
              availableDungeons.map((dungeon) => {
                const levelDiff = (user?.level || 1) - dungeon.minLevel;
                const difficulty = levelDiff >= 8 ? 'Easy' : levelDiff >= 5 ? 'Medium' : levelDiff >= 2 ? 'Hard' : 'Epic';
                const difficultyColor =
                  difficulty === 'Easy' ? 'text-green-400' :
                    difficulty === 'Medium' ? 'text-yellow-400' :
                      difficulty === 'Hard' ? 'text-orange-400' : 'text-red-400';

                return (
                  <motion.button
                    key={ dungeon.id }
                    whileHover={ { scale: 1.02 } }
                    whileTap={ { scale: 0.98 } }
                    onClick={ () => setSelectedDungeon(dungeon.id) }
                    disabled={ isClosing }
                    className={ `w-full p-4 rounded-lg border-2 text-left transition-all
                      ${selectedDungeon === dungeon.id
                        ? 'border-amber-500 bg-gray-700 shadow-lg'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{ dungeon.icon }</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white">{ dungeon.name }</h3>
                          <span className={ `text-xs font-bold ${difficultyColor}` }>
                            { difficulty }
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{ dungeon.description }</p>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span className="text-green-400">⚡ { dungeon.baseXP }+ XP</span>
                          <span className="text-yellow-400">🪙 { dungeon.baseGold }+ Gold</span>
                          <span className="text-gray-500">Lvl { dungeon.minLevel }+</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })
            ) }
          </div>
        </div>

        {/* Action Buttons */ }
        <div className="space-y-2">
          <button
            onClick={ handleStartExploration }
            disabled={ !selectedDungeon || isGenerating || isClosing }
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 
                     hover:from-amber-700 hover:to-amber-800
                     disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed 
                     text-white font-bold py-3 rounded-lg transition-all shadow-lg"
          >
            { isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={ { rotate: 360 } }
                  transition={ { duration: 1, repeat: Infinity, ease: "linear" } }
                >
                  ⏳
                </motion.span>
                Generating scenario...
              </span>
            ) : (
              '⚔️ Enter Dungeon'
            ) }
          </button>

          <button
            onClick={ handleClose }
            disabled={ isClosing }
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 
                     font-bold py-2.5 rounded-lg transition-all text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚪 Exit Explorer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};