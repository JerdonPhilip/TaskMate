import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { InventoryItem, LootSlot } from '../../types/loot';
import { RARITY_CONFIG } from '../../data/lootDatabase';

// Helper function for sell price (must match the one in store)
const calculateSellPrice = (item: InventoryItem): number => {
  const rarityMultiplier: Record<string, number> = {
    common: 1,
    uncommon: 3,
    rare: 8,
    epic: 20,
    legendary: 50,
  };
  
  const basePrice = 5;
  const multiplier = rarityMultiplier[item.rarity] || 1;
  const statBonus = Object.values(item.stats).reduce((sum, val) => sum + val, 0);
  
  return (basePrice * multiplier) + (statBonus * 3);
};

export const InventoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const inventory = useInventoryStore((state) => state.inventory);
  const equipment = useInventoryStore((state) => state.equipment);
  const equipItem = useInventoryStore((state) => state.equipItem);
  const unequipItem = useInventoryStore((state) => state.unequipItem);
  const sellItem = useInventoryStore((state) => state.sellItem);
  const gold = useInventoryStore((state) => state.gold);
  const getEquippedStats = useInventoryStore((state) => state.getEquippedStats);
  
  const [activeTab, setActiveTab] = useState<'all' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showSellConfirm, setShowSellConfirm] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [message, setMessage] = useState('');
  
  const equippedStats = getEquippedStats();
  
  const tabs = [
    { id: 'all' as const, label: 'All', icon: '📦' },
    { id: 'weapon' as const, label: 'Weapons', icon: '⚔️' },
    { id: 'armor' as const, label: 'Armor', icon: '🛡️' },
    { id: 'accessory' as const, label: 'Accessories', icon: '💍' },
    { id: 'consumable' as const, label: 'Consumables', icon: '🧪' },
    { id: 'material' as const, label: 'Materials', icon: '🪨' },
  ];
  
  const filteredInventory = activeTab === 'all' 
    ? inventory 
    : inventory.filter(item => item.slot === activeTab);

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const handleSell = (item: InventoryItem) => {
    setSelectedItem(item);
    setSellQuantity(1);
    setShowSellConfirm(true);
  };

  const confirmSell = () => {
    if (!selectedItem) return;
    
    const totalGold = sellItem(selectedItem.id, sellQuantity);
    setMessage(`✅ Sold for 🪙 ${totalGold} gold!`);
    setShowSellConfirm(false);
    setSelectedItem(null);
    
    setTimeout(() => setMessage(''), 2500);
  };

  const handleEquip = (item: InventoryItem) => {
    if (item.equipped) {
      unequipItem(item.slot as 'weapon' | 'armor' | 'accessory');
      setMessage(`✅ Unequipped ${item.name}`);
    } else {
      equipItem(item.id);
      setMessage(`✅ Equipped ${item.name}`);
    }
    setTimeout(() => setMessage(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => { 
          if (e.target === e.currentTarget) {
            setShowSellConfirm(false);
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 
                   border-amber-500/50 p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-yellow-400">🎒 Inventory</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {totalItems} items • Gold: 🪙 {gold.toLocaleString()}
              </p>
            </div>
            <button 
              onClick={() => {
                setShowSellConfirm(false);
                onClose();
              }} 
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-2 rounded-lg mb-3 text-xs font-bold text-center ${
                message.includes('✅') ? 'bg-green-500/20 text-green-400' : 
                message.includes('Sold') ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* Equipment Slots */}
          <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-700/30 rounded-lg p-3">
            {(['weapon', 'armor', 'accessory'] as LootSlot[]).map(slot => {
              const item = equipment[slot as 'weapon' | 'armor' | 'accessory'];
              return (
                <div key={slot} className="bg-gray-800 rounded-lg p-2 text-center border border-gray-600">
                  <div className="text-xs text-gray-400 capitalize mb-1">{slot}</div>
                  {item ? (
                    <div>
                      <span className="text-2xl">{item.icon}</span>
                      <div className={`text-[10px] font-bold ${RARITY_CONFIG[item.rarity]?.color || 'text-gray-300'} truncate`}>
                        {item.name}
                      </div>
                      {Object.entries(item.stats).map(([stat, value]) => (
                        value > 0 && (
                          <div key={stat} className="text-[9px] text-green-400">
                            +{value} {stat.slice(0, 3).toUpperCase()}
                          </div>
                        )
                      ))}
                      <button
                        onClick={() => handleEquip(item)}
                        className="text-[10px] text-red-400 hover:text-red-300 mt-1"
                      >
                        Unequip
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-xs py-2">Empty</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Equipped Stats Bonus */}
          {(equippedStats.strength > 0 || equippedStats.intelligence > 0 || equippedStats.agility > 0 || equippedStats.wisdom > 0) && (
            <div className="bg-purple-500/10 rounded-lg p-2 mb-3 border border-purple-500/30">
              <div className="text-xs text-purple-400 font-bold mb-1">Equipment Bonuses:</div>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                {equippedStats.strength > 0 && <div className="text-red-400">+{equippedStats.strength} STR</div>}
                {equippedStats.intelligence > 0 && <div className="text-blue-400">+{equippedStats.intelligence} INT</div>}
                {equippedStats.agility > 0 && <div className="text-green-400">+{equippedStats.agility} AGI</div>}
                {equippedStats.wisdom > 0 && <div className="text-yellow-400">+{equippedStats.wisdom} WIS</div>}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-none">
            {tabs.map(tab => {
              const count = tab.id === 'all' 
                ? inventory.length 
                : inventory.filter(i => i.slot === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                    ${activeTab === tab.id 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                >
                  {tab.icon} {tab.label}
                  {count > 0 && (
                    <span className="ml-1 bg-black/30 px-1.5 py-0.5 rounded-full text-[10px]">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Inventory Grid */}
          <div className="flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-400 text-sm">No items found</p>
                <p className="text-gray-500 text-xs mt-1">Explore dungeons to find loot!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredInventory.map(item => (
                  <InventoryCard 
                    key={item.id} 
                    item={item} 
                    onEquip={() => handleEquip(item)}
                    onSell={() => handleSell(item)}
                    isEquippable={item.slot === 'weapon' || item.slot === 'armor' || item.slot === 'accessory'}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sell Confirmation Modal */}
          <AnimatePresence>
            {showSellConfirm && selectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-gray-800 rounded-lg border-2 border-yellow-500/50 p-5 max-w-xs w-full mx-4 shadow-2xl"
                >
                  <h3 className="text-lg font-bold text-yellow-400 text-center mb-3">
                    💰 Sell Item
                  </h3>
                  
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-4 text-center">
                    <div className="text-3xl mb-2">{selectedItem.icon}</div>
                    <div className={`text-sm font-bold ${RARITY_CONFIG[selectedItem.rarity]?.color || 'text-white'}`}>
                      {selectedItem.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {RARITY_CONFIG[selectedItem.rarity]?.label || 'Common'}
                    </div>
                  </div>

                  {/* Quantity selector for stackable items */}
                  {selectedItem.quantity > 1 && (
                    <div className="mb-3">
                      <label className="block text-xs text-gray-400 mb-1 text-center">Quantity to sell:</label>
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => setSellQuantity(Math.max(1, sellQuantity - 1))}
                          className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-lg font-bold"
                        >
                          -
                        </button>
                        <span className="text-white font-bold text-lg w-8 text-center">
                          {sellQuantity}
                        </span>
                        <button
                          onClick={() => setSellQuantity(Math.min(selectedItem.quantity, sellQuantity + 1))}
                          className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-gray-500 text-[10px] text-center mt-1">
                        Max: {selectedItem.quantity}
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-500/10 rounded-lg p-3 mb-4 text-center">
                    <div className="text-xs text-gray-400">You will receive</div>
                    <div className="text-xl font-bold text-yellow-400">
                      🪙 {calculateSellPrice(selectedItem) * sellQuantity}
                    </div>
                    {sellQuantity > 1 && (
                      <div className="text-[10px] text-gray-500">
                        ({calculateSellPrice(selectedItem)} gold each)
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowSellConfirm(false);
                        setSelectedItem(null);
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmSell}
                      className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 
                               hover:to-amber-700 text-white font-bold py-2 rounded-lg text-sm transition-all"
                    >
                      Sell 🪙 {calculateSellPrice(selectedItem) * sellQuantity}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InventoryCard: React.FC<{ 
  item: InventoryItem; 
  onEquip: () => void; 
  onSell: () => void;
  isEquippable: boolean;
}> = ({ item, onEquip, onSell, isEquippable }) => {
  const rarity = RARITY_CONFIG[item.rarity] || { 
    color: 'text-gray-300', 
    bgColor: 'bg-gray-500/20', 
    borderColor: 'border-gray-500',
    label: 'Common'
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`bg-gray-800 rounded-lg p-3 border-2 ${rarity.borderColor} relative
        ${item.equipped ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/20' : ''}`}
    >
      {item.equipped && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full z-10">
          EQUIPPED ✓
        </div>
      )}
      
      <div className="text-center">
        <div className={`text-3xl mb-1 ${item.equipped ? 'animate-pulse' : ''}`}>{item.icon}</div>
        <div className={`text-xs font-bold ${rarity.color} mb-1 truncate`}>{item.name}</div>
        <div className={`text-[9px] ${rarity.color} mb-2`}>{rarity.label}</div>
        
        {/* Stats */}
        <div className="space-y-0.5 mb-2">
          {Object.entries(item.stats).map(([stat, value]) => (
            value > 0 && (
              <div key={stat} className={`text-[10px] ${item.equipped ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                +{value} {stat.slice(0, 3).toUpperCase()}
              </div>
            )
          ))}
        </div>
        
        {/* Sell Price */}
        <div className="text-[10px] text-yellow-400 mb-2">
          💰 {calculateSellPrice(item)} gold
        </div>
        
        {item.quantity > 1 && (
          <div className="text-xs text-gray-500 mb-2">x{item.quantity}</div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-1">
          {isEquippable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEquip();
              }}
              className={`flex-1 text-[10px] font-bold py-1.5 rounded transition-colors ${
                item.equipped 
                  ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' 
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {item.equipped ? 'Unequip' : 'Equip'}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSell();
            }}
            disabled={item.equipped}
            className={`flex-1 text-[10px] font-bold py-1.5 rounded transition-colors ${
              item.equipped 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400'
            }`}
          >
            {item.equipped ? 'Equipped' : 'Sell'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};