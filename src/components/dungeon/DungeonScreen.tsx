import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDungeonStore } from '../../stores/useDungeonStore';
import { useUserStore } from '../../stores/useUserStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { DungeonChoice } from '../../services/dungeonEngine';
import { getDungeonLoot, RARITY_CONFIG } from '../../data/lootDatabase';
import { LootItem } from '../../types/loot';
import { calculateDungeonDamage } from '../../utils/combatStats';

export const DungeonScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const user = useUserStore((state) => state.user);
  const addXP = useUserStore((state) => state.addXP);
  const addGold = useUserStore((state) => state.addGold);
  const addItem = useInventoryStore((state) => state.addItem);
  const addGoldToInventory = useInventoryStore((state) => state.addGold);

  const {
    currentDungeon,
    currentScenario,
    currentResult,
    isGenerating,
    makeChoice,
    endExploration,
  } = useDungeonStore();

  const [showResult, setShowResult] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<DungeonChoice | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [droppedLoot, setDroppedLoot] = useState<LootItem[]>([]);

  const getEquippedStats = useInventoryStore((state) => state.getEquippedStats);

  if (!currentDungeon || !currentScenario) return null;

  const handleChoice = async (choice: DungeonChoice) => {
    setSelectedChoice(choice);
    setShowResult(true);

    const baseStats = user?.stats || { strength: 5, intelligence: 5, agility: 5, wisdom: 5 };
    const equippedStats = getEquippedStats();

    const totalStats = {
      strength: baseStats.strength + (equippedStats.strength || 0),
      intelligence: baseStats.intelligence + (equippedStats.intelligence || 0),
      agility: baseStats.agility + (equippedStats.agility || 0),
      wisdom: baseStats.wisdom + (equippedStats.wisdom || 0),
    };

    await makeChoice(choice, totalStats);

    // Apply damage based on result
    const result = useDungeonStore.getState().currentResult;
    if (result && user) {
      const damage = calculateDungeonDamage(
        currentScenario?.difficulty || 'medium',
        result.success,
        user.maxHP,
        user.maxMana
      );

      const userStore = useUserStore.getState();
      userStore.takeDamage(damage.hpLoss, damage.manaLoss);

      if (!result.success) {
        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: {
              message: `💀 Defeated! Lost ${damage.hpLoss} HP and ${damage.manaLoss} Mana`,
              type: 'error'
            },
          })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: {
              message: `⚔️ Victory! Took ${damage.hpLoss} HP damage from battle`,
              type: 'info'
            },
          })
        );
      }
    }

    // Generate loot drops
    if (currentDungeon && user) {
      const loot = getDungeonLoot(currentDungeon.minLevel, user.level);
      setDroppedLoot(loot);
    }
  };

  const handleCollectRewards = () => {
    if (currentResult) {
      // Add XP to user
      addXP(currentResult.xpEarned, 'dungeon');

      // Add gold to BOTH stores
      addGold(currentResult.goldEarned); // User store
      addGoldToInventory(currentResult.goldEarned); // Inventory store

      // Add loot items to inventory
      if (currentResult.success && droppedLoot.length > 0) {
        droppedLoot.forEach(item => {
          addItem(item, 1);
        });

        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: {
              message: `🎁 Collected ${droppedLoot.length} item(s)! Check your inventory!`,
              type: 'success'
            },
          })
        );
      }
    }
    handleExit();
  };

  const handleRetreat = () => {
    // If retreating with loot available, get 1 random item
    if (droppedLoot.length > 0) {
      const randomItem = droppedLoot[Math.floor(Math.random() * droppedLoot.length)];
      addItem(randomItem, 1);

      window.dispatchEvent(
        new CustomEvent('show-notification', {
          detail: {
            message: `🏃 Retreat successful! Found: ${randomItem.name}`,
            type: 'info'
          },
        })
      );
    }
    handleExit();
  };

  const handleExit = () => {
    setIsLeaving(true);
    setShowResult(false);
    setSelectedChoice(null);
    setDroppedLoot([]);

    setTimeout(() => {
      endExploration();
      setIsLeaving(false);
      onClose();
    }, 200);
  };

  return (
    <motion.div
      initial={ { opacity: 0 } }
      animate={ { opacity: 1 } }
      exit={ { opacity: 0 } }
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={ { scale: 0.9, y: 20 } }
        animate={ { scale: 1, y: 0 } }
        exit={ { scale: 0.9, y: 20 } }
        className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 
                 border-amber-500/50 p-6 max-w-lg w-full shadow-2xl relative
                 max-h-[90vh] overflow-y-auto
                 scrollbar-none
                 [&::-webkit-scrollbar]:hidden
                 [-ms-overflow-style:none]
                 [scrollbar-width:none]"
      >
        {/* Exit Button */ }
        <button
          onClick={ handleExit }
          disabled={ isLeaving }
          className="absolute top-3 right-3 text-gray-400 hover:text-white 
                   transition-colors text-2xl hover:bg-gray-700/50 rounded-full 
                   w-10 h-10 flex items-center justify-center z-10
                   disabled:opacity-50 disabled:cursor-not-allowed"
          title="Leave dungeon"
        >
          ✕
        </button>

        {/* Dungeon Header */ }
        <div className="text-center mb-4 pr-10">
          <div className="text-4xl mb-2">{ currentDungeon.icon }</div>
          <h2 className="text-xl font-bold text-yellow-400">{ currentScenario.title }</h2>
          <p className="text-sm text-gray-400 mt-1">{ currentDungeon.name }</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Level { user?.level || 1 } { user?.class || 'Adventurer' }
          </p>
        </div>

        <AnimatePresence mode="wait">
          { !showResult ? (
            /* Scenario Screen */
            <motion.div
              key="scenario"
              initial={ { opacity: 0 } }
              animate={ { opacity: 1 } }
              exit={ { opacity: 0 } }
            >
              {/* Description */ }
              <div className="bg-gray-700/50 rounded-lg p-4 mb-4 border border-gray-600">
                <p className="text-gray-200 text-sm leading-relaxed">
                  { currentScenario.description }
                </p>
                <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                  <p className="text-gray-300 text-sm">
                    <span className="text-gray-400 font-semibold">🌍 Environment:</span> { currentScenario.environment }
                  </p>
                  <p className="text-gray-300 text-sm">
                    <span className="text-gray-400 font-semibold">⚔️ Challenge:</span> { currentScenario.challenge }
                  </p>
                </div>
              </div>

              {/* Rewards Preview */ }
              <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-bold text-gray-200 mb-3">🏆 Potential Rewards</h3>
                <div className="flex justify-around text-center">
                  <div className="bg-gray-800 rounded-lg p-3 px-5">
                    <div className="text-green-400 font-bold text-base">⚡ { currentScenario.rewards.xp } XP</div>
                    <div className="text-gray-400 text-xs mt-1">Experience</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 px-5">
                    <div className="text-yellow-400 font-bold text-base">🪙 { currentScenario.rewards.gold } Gold</div>
                    <div className="text-gray-400 text-xs mt-1">Base Reward</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 px-5">
                    <div className="text-purple-400 font-bold text-base">
                      { currentScenario.difficulty.toUpperCase() }
                    </div>
                    <div className="text-gray-400 text-xs mt-1">Difficulty</div>
                  </div>
                </div>
              </div>

              {/* Choices */ }
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-bold text-gray-200 mb-2">🤔 What do you do?</h3>
                { currentScenario.choices.map((choice) => (
                  <motion.button
                    key={ choice.id }
                    whileHover={ { scale: 1.02 } }
                    whileTap={ { scale: 0.98 } }
                    onClick={ () => handleChoice(choice) }
                    disabled={ isGenerating || isLeaving }
                    className={ `w-full p-4 rounded-lg border-2 text-left transition-all
                      ${choice.risk === 'high'
                        ? 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10'
                        : choice.risk === 'medium'
                          ? 'border-yellow-500/50 bg-yellow-500/5 hover:bg-yellow-500/10'
                          : 'border-green-500/50 bg-green-500/5 hover:bg-green-500/10'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white text-sm flex-1">{ choice.text }</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={ `text-xs font-bold px-2 py-1 rounded-full ${choice.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                          choice.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }` }>
                          { choice.risk.toUpperCase() }
                        </span>
                        <span className={ `text-sm font-bold ${choice.successChance >= 70 ? 'text-green-400' :
                          choice.successChance >= 40 ? 'text-yellow-400' :
                            'text-red-400'
                          }` }>
                          { choice.successChance }%
                        </span>
                      </div>
                    </div>
                  </motion.button>
                )) }
              </div>

              {/* Retreat Button */ }
              <button
                onClick={ handleRetreat }
                disabled={ isLeaving }
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 
                         font-bold py-2.5 rounded-lg transition-all text-sm
                         border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🏃 Retreat to Safety
              </button>
            </motion.div>
          ) : (
            /* Result Screen */
            <motion.div
              key="result"
              initial={ { opacity: 0, y: 20 } }
              animate={ { opacity: 1, y: 0 } }
            >
              { currentResult ? (
                <>
                  {/* Result Banner */ }
                  <div className={ `text-center p-4 rounded-lg mb-4 ${currentResult.success
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                    }` }>
                    <motion.div
                      animate={ currentResult.success ? { scale: [1, 1.2, 1] } : {} }
                      transition={ { duration: 0.5 } }
                      className="text-5xl mb-2"
                    >
                      { currentResult.success ? '🎉' : '💀' }
                    </motion.div>
                    <h3 className={ `text-xl font-bold ${currentResult.success ? 'text-green-400' : 'text-red-400'
                      }` }>
                      { currentResult.success ? 'Victory!' : 'Defeat!' }
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      { currentResult.success ? 'You conquered the dungeon!' : 'Better luck next time...' }
                    </p>
                  </div>

                  {/* Narrative */ }
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-4 border border-gray-600">
                    <h3 className="text-sm font-bold text-gray-300 mb-2">📜 Story</h3>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      { currentResult.narrative }
                    </p>
                    { currentResult.consequences && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-gray-400 text-sm italic">
                          💬 { currentResult.consequences }
                        </p>
                      </div>
                    ) }
                  </div>

                  {/* Rewards */ }
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-bold text-gray-200 mb-3">🎁 Rewards Earned</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <motion.div
                        initial={ { scale: 0 } }
                        animate={ { scale: 1 } }
                        transition={ { delay: 0.2, type: "spring" } }
                        className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700"
                      >
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-xl font-bold text-green-400">
                          +{ currentResult.xpEarned }
                        </div>
                        <div className="text-sm text-gray-400">Experience</div>
                      </motion.div>
                      <motion.div
                        initial={ { scale: 0 } }
                        animate={ { scale: 1 } }
                        transition={ { delay: 0.3, type: "spring" } }
                        className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700"
                      >
                        <div className="text-2xl mb-1">🪙</div>
                        <div className="text-xl font-bold text-yellow-400">
                          +{ currentResult.goldEarned }
                        </div>
                        <div className="text-sm text-gray-400">Gold Coins</div>
                      </motion.div>
                    </div>

                    {/* Loot Drops */ }
                    { currentResult.success && droppedLoot.length > 0 && (
                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                        <div className="text-sm text-purple-400 font-bold mb-3">
                          💎 Loot Drops ({ droppedLoot.length } items):
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          { droppedLoot.map((item, i) => {
                            const rarity = RARITY_CONFIG[item.rarity];
                            return (
                              <motion.div
                                key={ `${item.id}-${i}` }
                                initial={ { opacity: 0, y: 10 } }
                                animate={ { opacity: 1, y: 0 } }
                                transition={ { delay: 0.5 + i * 0.1 } }
                                className={ `bg-gray-800 rounded-lg p-3 border-2 ${rarity.borderColor} text-center` }
                              >
                                <div className="text-2xl mb-1">{ item.icon }</div>
                                <div className={ `text-xs font-bold ${rarity.color} mb-1` }>
                                  { item.name }
                                </div>
                                <div className={ `text-[10px] font-bold ${rarity.color} mb-2` }>
                                  { rarity.label }
                                </div>
                                { Object.entries(item.stats).map(([stat, value]) => (
                                  value > 0 && (
                                    <div key={ stat } className="text-[10px] text-gray-400">
                                      +{ value } { stat.slice(0, 3).toUpperCase() }
                                    </div>
                                  )
                                )) }
                                { item.slot === 'consumable' && (
                                  <div className="text-[10px] text-gray-500 mt-1">Consumable</div>
                                ) }
                                { item.slot === 'material' && (
                                  <div className="text-[10px] text-gray-500 mt-1">Material</div>
                                ) }
                              </motion.div>
                            );
                          }) }
                        </div>
                      </div>
                    ) }

                    { !currentResult.success && droppedLoot.length > 0 && (
                      <div className="bg-gray-700/30 rounded-lg p-3 text-center border border-gray-600">
                        <p className="text-gray-300 text-sm">
                          💡 Retreating will give you 1 random item
                        </p>
                      </div>
                    ) }

                    { droppedLoot.length === 0 && currentResult.success && (
                      <div className="bg-gray-700/30 rounded-lg p-3 text-center border border-gray-600">
                        <p className="text-gray-400 text-sm">
                          No items dropped this time. Try harder dungeons!
                        </p>
                      </div>
                    ) }
                  </div>

                  {/* Action Buttons */ }
                  <div className="flex gap-2">
                    <button
                      onClick={ handleRetreat }
                      disabled={ isLeaving }
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 
                               font-bold py-3 rounded-lg transition-all text-sm
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🚪 { currentResult.success ? 'Leave (1 item)' : 'Retreat (1 item)' }
                    </button>
                    { currentResult.success && (
                      <button
                        onClick={ handleCollectRewards }
                        disabled={ isLeaving }
                        className="flex-[2] bg-gradient-to-r from-amber-600 to-amber-700 
                                 hover:from-amber-700 hover:to-amber-800
                                 text-white font-bold py-3 rounded-lg transition-all 
                                 shadow-lg text-sm
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🎒 Collect All ({ droppedLoot.length } items)
                      </button>
                    ) }
                  </div>
                </>
              ) : (
                /* Loading State */
                <div className="text-center py-12">
                  <motion.div
                    animate={ { rotate: 360 } }
                    transition={ { duration: 2, repeat: Infinity, ease: "linear" } }
                    className="text-6xl mb-6"
                  >
                    ⏳
                  </motion.div>
                  <p className="text-gray-200 font-bold text-lg mb-2">
                    Resolving your choice...
                  </p>
                  <p className="text-gray-400 text-sm">
                    { selectedChoice?.risk === 'high' ? 'Bold move! Let\'s see how it plays out...' :
                      selectedChoice?.risk === 'medium' ? 'Calculating the outcome...' :
                        'Careful approach being evaluated...' }
                  </p>
                  <button
                    onClick={ handleRetreat }
                    className="mt-6 text-gray-500 hover:text-gray-400 text-sm underline"
                  >
                    Cancel and retreat
                  </button>
                </div>
              ) }
            </motion.div>
          ) }
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};