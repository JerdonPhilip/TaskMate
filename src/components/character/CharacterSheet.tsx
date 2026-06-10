import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../stores/useUserStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { StatAllocation } from './StatAllocation';
import { ResetCharacterModal } from './ResetCharacterModal';
import { CLASS_CONFIGS, getStatIcon } from '../../utils/classStats';

export const CharacterSheet: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const getLevelProgress = useUserStore((state) => state.getLevelProgress);
  const getXPToNextLevel = useUserStore((state) => state.getXPToNextLevel);
  const [showStatAllocation, setShowStatAllocation] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const getEquippedStats = useInventoryStore((state) => state.getEquippedStats);
  const equipment = useInventoryStore((state) => state.equipment);
  const equippedStats = getEquippedStats();
  const inventoryGold = useInventoryStore((state) => state.gold);

  if (!user) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400 text-center text-base">
          No character created yet
        </p>
      </div>
    );
  }

  const progress = Math.min(getLevelProgress(), 100);
  const xpToNext = getXPToNextLevel();
  const classConfig = CLASS_CONFIGS[user.class];

  const gold = inventoryGold || user.gold || 0;
  const totalXP = user.totalXP ?? 0;
  const level = user.level ?? 1;
  const questsCompleted = user.questsCompleted ?? 0;
  const questsFailed = user.questsFailed ?? 0;
  const currentStreak = user.streaks?.currentStreak ?? 0;
  const baseStats = user.stats ?? { strength: 0, intelligence: 0, agility: 0, wisdom: 0 };
  const statPoints = user.statPoints ?? 0;

  const currentHP = user.currentHP ?? 0;
  const maxHP = user.maxHP ?? 100;
  const currentMana = user.currentMana ?? 0;
  const maxMana = user.maxMana ?? 100;

  const hpPercentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
  const manaPercentage = maxMana > 0 ? (currentMana / maxMana) * 100 : 0;

  const totalStats = {
    strength: baseStats.strength + (equippedStats.strength || 0),
    intelligence: baseStats.intelligence + (equippedStats.intelligence || 0),
    agility: baseStats.agility + (equippedStats.agility || 0),
    wisdom: baseStats.wisdom + (equippedStats.wisdom || 0),
  };

  const hasEquipmentBonus = equippedStats.strength > 0 || equippedStats.intelligence > 0 ||
    equippedStats.agility > 0 || equippedStats.wisdom > 0;

  return (
    <>
      <motion.div
        initial={ { opacity: 0, y: -20 } }
        animate={ { opacity: 1, y: 0 } }
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg 
                   border-2 border-amber-700/50 p-5 shadow-xl"
      >
        <div className="flex flex-col gap-5">
          {/* Top Row: Character Info, Resources, Progress */ }
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Character Info */ }
            <div className="flex items-center gap-4">
              <div className="text-5xl bg-gray-700/50 rounded-full p-3 flex-shrink-0">
                { classConfig.icon }
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xl text-white truncate">{ user.name }</h3>
                <p className="text-amber-400 font-semibold text-base">
                  Level { level } { classConfig.name }
                </p>
                <p className="text-gray-400 text-sm">
                  { user.title?.charAt(0).toUpperCase() + user.title?.slice(1) }
                </p>
              </div>
            </div>

            {/* Resources: Gold & XP */ }
            <div className="flex gap-3">
              <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 
                             rounded-lg px-4 py-3 border border-yellow-500/30 text-center min-w-[90px]">
                <div className="text-2xl mb-1">🪙</div>
                <div className="text-lg font-bold text-yellow-400">{ gold.toLocaleString() }</div>
                <div className="text-xs text-gray-400 font-semibold">Gold</div>
              </div>
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 
                             rounded-lg px-4 py-3 border border-green-500/30 text-center min-w-[90px]">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-lg font-bold text-green-400">{ totalXP.toLocaleString() }</div>
                <div className="text-xs text-gray-400 font-semibold">XP</div>
              </div>
            </div>

            {/* XP Progress Bar */ }
            <div className="flex-1 max-w-sm">
              <div className="flex justify-between text-sm text-gray-300 mb-1.5">
                <span className="font-semibold">Progress to Level { level + 1 }</span>
                <span className="font-bold">{ Math.round(progress) }%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-5 border border-gray-600 overflow-hidden">
                <motion.div
                  initial={ { width: 0 } }
                  animate={ { width: `${progress}%` } }
                  transition={ { duration: 1, ease: "easeOut" } }
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full relative"
                >
                  { progress > 10 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80">
                      { xpToNext.toLocaleString() } XP needed
                    </span>
                  ) }
                </motion.div>
              </div>
            </div>
          </div>

          {/* HP and Mana Bars */ }
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* HP Bar */ }
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❤️</span>
                  <span className="text-red-400 font-bold text-base">Health</span>
                </div>
                <span className="text-white font-bold text-base">
                  { currentHP } <span className="text-gray-400 text-sm">/ { maxHP }</span>
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-6 border border-gray-600 overflow-hidden">
                <motion.div
                  animate={ { width: `${hpPercentage}%` } }
                  transition={ { duration: 0.5 } }
                  className={ `h-full rounded-full transition-all ${hpPercentage > 50 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                      hpPercentage > 25 ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
                        'bg-gradient-to-r from-red-700 to-red-500 animate-pulse'
                    }` }
                />
              </div>
              { hpPercentage < 30 && (
                <p className="text-red-400 text-sm mt-2 font-semibold">⚠️ Low health! Visit the shop for potions!</p>
              ) }
            </div>

            {/* Mana Bar */ }
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💙</span>
                  <span className="text-blue-400 font-bold text-base">Mana</span>
                </div>
                <span className="text-white font-bold text-base">
                  { currentMana } <span className="text-gray-400 text-sm">/ { maxMana }</span>
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-6 border border-gray-600 overflow-hidden">
                <motion.div
                  animate={ { width: `${manaPercentage}%` } }
                  transition={ { duration: 0.5 } }
                  className={ `h-full rounded-full transition-all ${manaPercentage > 50 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                      manaPercentage > 25 ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                        'bg-gradient-to-r from-blue-700 to-blue-500 animate-pulse'
                    }` }
                />
              </div>
              { manaPercentage < 30 && (
                <p className="text-blue-400 text-sm mt-2 font-semibold">⚠️ Low mana! Meditate or use potions!</p>
              ) }
            </div>
          </div>

          {/* Bottom Row: Stats, Actions, Quest Info */ }
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Stats Section */ }
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-bold hidden lg:block">Stats:</span>
              <div className="flex gap-2">
                {/* Strength */ }
                <div className="bg-gray-700/50 rounded-lg px-4 py-2.5 text-center border border-gray-600 relative">
                  <div className="text-xl mb-1">{ getStatIcon('strength') }</div>
                  <div className="text-xs text-gray-400 font-bold mb-0.5">STR</div>
                  <div className="text-lg font-bold text-white">{ totalStats.strength }</div>
                  { equippedStats.strength > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold 
                                   px-1.5 py-0.5 rounded-full shadow-lg">
                      +{ equippedStats.strength }
                    </span>
                  ) }
                </div>
                {/* Intelligence */ }
                <div className="bg-gray-700/50 rounded-lg px-4 py-2.5 text-center border border-gray-600 relative">
                  <div className="text-xl mb-1">{ getStatIcon('intelligence') }</div>
                  <div className="text-xs text-gray-400 font-bold mb-0.5">INT</div>
                  <div className="text-lg font-bold text-white">{ totalStats.intelligence }</div>
                  { equippedStats.intelligence > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold 
                                   px-1.5 py-0.5 rounded-full shadow-lg">
                      +{ equippedStats.intelligence }
                    </span>
                  ) }
                </div>
                {/* Agility */ }
                <div className="bg-gray-700/50 rounded-lg px-4 py-2.5 text-center border border-gray-600 relative">
                  <div className="text-xl mb-1">{ getStatIcon('agility') }</div>
                  <div className="text-xs text-gray-400 font-bold mb-0.5">AGI</div>
                  <div className="text-lg font-bold text-white">{ totalStats.agility }</div>
                  { equippedStats.agility > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold 
                                   px-1.5 py-0.5 rounded-full shadow-lg">
                      +{ equippedStats.agility }
                    </span>
                  ) }
                </div>
                {/* Wisdom */ }
                <div className="bg-gray-700/50 rounded-lg px-4 py-2.5 text-center border border-gray-600 relative">
                  <div className="text-xl mb-1">{ getStatIcon('wisdom') }</div>
                  <div className="text-xs text-gray-400 font-bold mb-0.5">WIS</div>
                  <div className="text-lg font-bold text-white">{ totalStats.wisdom }</div>
                  { equippedStats.wisdom > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold 
                                   px-1.5 py-0.5 rounded-full shadow-lg">
                      +{ equippedStats.wisdom }
                    </span>
                  ) }
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Stat Points Button */ }
              { statPoints > 0 && (
                <motion.button
                  whileHover={ { scale: 1.05 } }
                  whileTap={ { scale: 0.95 } }
                  onClick={ () => setShowStatAllocation(true) }
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 
                           hover:to-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm
                           shadow-lg animate-pulse whitespace-nowrap"
                >
                  ⭐ { statPoints } Stat Point{ statPoints > 1 ? 's' : '' } Available!
                </motion.button>
              ) }

              {/* Equipment Bonus */ }
              { hasEquipmentBonus && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2.5 text-center">
                  <p className="text-green-400 text-sm font-bold">
                    🛡️ Equipment: +{ equippedStats.strength + equippedStats.intelligence + equippedStats.agility + equippedStats.wisdom } Total Stats
                  </p>
                </div>
              ) }

              {/* Quest Stats */ }
              <div className="flex gap-4 text-center bg-gray-700/30 rounded-lg px-4 py-2.5">
                <div>
                  <div className="text-xs text-gray-400 font-semibold">Completed</div>
                  <div className="font-bold text-green-400 text-lg">{ questsCompleted }</div>
                </div>
                <div className="border-l border-gray-600"></div>
                <div>
                  <div className="text-xs text-gray-400 font-semibold">Failed</div>
                  <div className="font-bold text-red-400 text-lg">{ questsFailed }</div>
                </div>
                <div className="border-l border-gray-600"></div>
                <div>
                  <div className="text-xs text-gray-400 font-semibold">Streak</div>
                  <div className="font-bold text-yellow-400 text-lg">{ currentStreak }🔥</div>
                </div>
              </div>

              {/* Equipped Items */ }
              <div className="flex gap-2 items-center bg-gray-700/30 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-400 font-semibold">Equipped:</span>
                { (equipment.weapon || equipment.armor || equipment.accessory) ? (
                  <div className="flex gap-1.5">
                    { equipment.weapon && (
                      <span className="text-lg cursor-help" title={ `${equipment.weapon.name}\n${equipment.weapon.rarity}` }>
                        { equipment.weapon.icon }
                      </span>
                    ) }
                    { equipment.armor && (
                      <span className="text-lg cursor-help" title={ `${equipment.armor.name}\n${equipment.armor.rarity}` }>
                        { equipment.armor.icon }
                      </span>
                    ) }
                    { equipment.accessory && (
                      <span className="text-lg cursor-help" title={ `${equipment.accessory.name}\n${equipment.accessory.rarity}` }>
                        { equipment.accessory.icon }
                      </span>
                    ) }
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs italic">Nothing equipped</span>
                ) }
              </div>

              {/* Reset Button */ }
              <button
                onClick={ () => setShowResetModal(true) }
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 
                         transition-all px-3 py-2 border border-gray-600 hover:border-red-500/50 
                         rounded-lg hover:bg-red-500/10 font-semibold"
                title="Reset Character"
              >
                <span>🔄</span>
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <StatAllocation
        isOpen={ showStatAllocation }
        onClose={ () => setShowStatAllocation(false) }
      />

      <ResetCharacterModal
        isOpen={ showResetModal }
        onClose={ () => setShowResetModal(false) }
      />
    </>
  );
};