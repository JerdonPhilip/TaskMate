import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../stores/useUserStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { getAvailablePotions, Potion } from '../../data/potionShop';

export const ShopModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const user = useUserStore((state) => state.user);
  const updateHP = useUserStore((state) => state.updateHP);
  const updateMana = useUserStore((state) => state.updateMana);
  
  const gold = useInventoryStore((state) => state.gold);
  const inventory = useInventoryStore((state) => state.inventory);
  const spendGold = useInventoryStore((state) => state.spendGold);
  const addItem = useInventoryStore((state) => state.addItem);
  const removeItem = useInventoryStore((state) => state.removeItem);
  
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'use'>('buy');
  const [freeHealUses, setFreeHealUses] = useState(3);
  const [freeMeditateUses, setFreeMeditateUses] = useState(3);

  if (!isOpen || !user) return null;

  const availablePotions = getAvailablePotions(user.level);
  
  const hpPercentage = (user.currentHP / user.maxHP) * 100;
  const manaPercentage = (user.currentMana / user.maxMana) * 100;

  // Get potions from inventory (for Use tab)
  const hpPotionsInInventory = inventory.filter(item => 
    item.lootId.includes('hp_potion') || item.name.includes('HP Potion')
  );
  const manaPotionsInInventory = inventory.filter(item => 
    item.lootId.includes('mana_potion') || item.name.includes('Mana Potion')
  );
  const allPotionsInInventory = [...hpPotionsInInventory, ...manaPotionsInInventory];

  const handleBuy = (potion: Potion) => {
    const totalCost = potion.buyPrice * quantity;
    
    if (gold >= totalCost) {
      if (spendGold(totalCost)) {
        // Add potion as inventory item
        addItem({
          id: potion.id,
          name: potion.name,
          description: potion.description,
          rarity: potion.rarity,
          slot: 'consumable',
          icon: potion.icon,
          stats: {},
          buyPrice: potion.buyPrice,
          sellPrice: potion.sellPrice,
          levelRequired: potion.levelRequired,
          dropChance: 0,
        }, quantity);
        
        setMessage(`✅ Purchased ${quantity}x ${potion.name}!`);
        setTimeout(() => setMessage(''), 2000);
      }
    } else {
      setMessage('❌ Not enough gold!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleUsePotion = (inventoryItem: any) => {
    // Find the potion data
    const potion = availablePotions.find(p => 
      inventoryItem.name.includes(p.name) || p.id === inventoryItem.lootId
    );
    
    if (!potion) {
      setMessage('❌ Cannot use this item!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    // Check if already at max
    if (potion.type === 'hp' && user.currentHP >= user.maxHP) {
      setMessage('❤️ HP is already full!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (potion.type === 'mana' && user.currentMana >= user.maxMana) {
      setMessage('💙 Mana is already full!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    // Apply the potion effect
    if (potion.type === 'hp') {
      updateHP(potion.restoreAmount);
      setMessage(`✅ Used ${potion.name}! Restored ${potion.restoreAmount} HP!`);
    } else {
      updateMana(potion.restoreAmount);
      setMessage(`✅ Used ${potion.name}! Restored ${potion.restoreAmount} Mana!`);
    }

    // Remove the potion from inventory (reduce quantity by 1)
    removeItem(inventoryItem.id, 1);
    
    setTimeout(() => setMessage(''), 2000);
  };

  const handleQuickHeal = () => {
    if (freeHealUses <= 0) {
      setMessage('❌ No free heals remaining! Buy potions or wait for daily reset.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (user.currentHP >= user.maxHP) {
      setMessage('❤️ HP is already full!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    
    updateHP(Math.floor(user.maxHP * 0.3));
    setFreeHealUses(prev => prev - 1);
    setMessage(`💚 Quick heal used! +30% HP (${freeHealUses - 1} free heals left)`);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleQuickMeditate = () => {
    if (freeMeditateUses <= 0) {
      setMessage('❌ No free meditations remaining! Buy potions or wait for daily reset.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (user.currentMana >= user.maxMana) {
      setMessage('💙 Mana is already full!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    
    updateMana(Math.floor(user.maxMana * 0.3));
    setFreeMeditateUses(prev => prev - 1);
    setMessage(`💙 Meditation used! +30% Mana (${freeMeditateUses - 1} free meditations left)`);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleFullRest = () => {
    if (gold >= 50) {
      if (spendGold(50)) {
        updateHP(user.maxHP);
        updateMana(user.maxMana);
        setMessage('✅ Full rest complete! HP and Mana fully restored for 50 gold!');
        setTimeout(() => setMessage(''), 2500);
      }
    } else {
      setMessage('❌ Need 50 gold for a full rest!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 
                   border-amber-500/50 p-6 max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-yellow-400">🏪 Potion Shop</h2>
              <p className="text-gray-400 text-sm mt-0.5">Gold: 🪙 {gold.toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
          </div>

          {/* HP/Mana Bars */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-400 font-bold">❤️ HP</span>
                <span className="text-white font-bold">{user.currentHP}/{user.maxHP}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                <motion.div
                  animate={{ width: `${hpPercentage}%` }}
                  className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-400 font-bold">💙 Mana</span>
                <span className="text-white font-bold">{user.currentMana}/{user.maxMana}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                <motion.div
                  animate={{ width: `${manaPercentage}%` }}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={handleQuickHeal}
              disabled={freeHealUses <= 0}
              className="bg-red-500/10 hover:bg-red-500/20 disabled:bg-gray-700/50 disabled:opacity-50
                       border border-red-500/30 rounded-lg p-2 text-center transition-all"
            >
              <div className="text-lg mb-0.5">💚</div>
              <div className="text-xs font-bold text-red-400">Quick Heal</div>
              <div className="text-[10px] text-gray-400">{freeHealUses}/3 free</div>
            </button>
            <button
              onClick={handleQuickMeditate}
              disabled={freeMeditateUses <= 0}
              className="bg-blue-500/10 hover:bg-blue-500/20 disabled:bg-gray-700/50 disabled:opacity-50
                       border border-blue-500/30 rounded-lg p-2 text-center transition-all"
            >
              <div className="text-lg mb-0.5">💙</div>
              <div className="text-xs font-bold text-blue-400">Meditate</div>
              <div className="text-[10px] text-gray-400">{freeMeditateUses}/3 free</div>
            </button>
            <button
              onClick={handleFullRest}
              className="bg-purple-500/10 hover:bg-purple-500/20 
                       border border-purple-500/30 rounded-lg p-2 text-center transition-all"
            >
              <div className="text-lg mb-0.5">🏨</div>
              <div className="text-xs font-bold text-purple-400">Full Rest</div>
              <div className="text-[10px] text-gray-400">50 🪙</div>
            </button>
          </div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-2.5 rounded-lg mb-3 text-sm font-bold text-center ${
                message.includes('✅') ? 'bg-green-500/20 text-green-400' : 
                message.includes('❌') ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'buy' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              🛒 Buy Potions
            </button>
            <button
              onClick={() => setActiveTab('use')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative ${
                activeTab === 'use' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              🧪 Use Potions
              {allPotionsInInventory.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] 
                               font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {allPotionsInInventory.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
            {activeTab === 'buy' ? (
              /* Buy Tab */
              <div className="space-y-2">
                {availablePotions.map(potion => (
                  <div
                    key={potion.id}
                    className={`bg-gray-800 rounded-lg p-3 border ${
                      potion.rarity === 'rare' ? 'border-blue-500/50' :
                      potion.rarity === 'uncommon' ? 'border-green-500/50' :
                      'border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{potion.icon}</span>
                        <div>
                          <div className="text-white font-bold text-sm">{potion.name}</div>
                          <div className="text-gray-400 text-xs">
                            Restores {potion.restoreAmount} {potion.type.toUpperCase()}
                          </div>
                          <div className="text-gray-500 text-[10px]">
                            Req. Level {potion.levelRequired} • {potion.rarity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold text-sm">
                          🪙 {potion.buyPrice}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-14 bg-gray-700 border border-gray-600 rounded px-1.5 py-1 
                                     text-white text-sm text-center"
                          />
                          <button
                            onClick={() => handleBuy(potion)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-sm 
                                     font-bold px-3 py-1 rounded transition-colors"
                          >
                            Buy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Use Tab */
              <div className="space-y-2">
                {allPotionsInInventory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">🧪</div>
                    <p className="text-gray-400 text-base">No potions in inventory</p>
                    <p className="text-gray-500 text-sm mt-1">Buy potions from the Buy tab or find them in dungeons!</p>
                  </div>
                ) : (
                  allPotionsInInventory.map(item => {
                    const potion = availablePotions.find(p => 
                      item.name.includes(p.name) || p.id === item.lootId
                    );
                    return (
                      <div
                        key={item.id}
                        className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <div className="text-white font-bold text-sm">{item.name}</div>
                              <div className="text-gray-400 text-xs">
                                Restores {potion?.restoreAmount || '?'} {potion?.type?.toUpperCase() || '?'}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Quantity: x{item.quantity}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUsePotion(item)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm 
                                     font-bold px-4 py-2 rounded transition-colors"
                          >
                            Use
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};