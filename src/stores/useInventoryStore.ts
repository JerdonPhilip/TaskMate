import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InventoryItem, Equipment, LootItem } from '../types/loot';
import { generateId } from '../utils/uuid';

interface InventoryState {
  inventory: InventoryItem[];
  equipment: Equipment;
  gold: number;
  
  addItem: (lootItem: LootItem, quantity?: number) => void;
  removeItem: (inventoryId: string, quantity?: number) => void;
  sellItem: (inventoryId: string, quantity?: number) => number;
  buyItem: (lootItem: LootItem, quantity?: number) => boolean;
  equipItem: (inventoryId: string) => void;
  unequipItem: (slot: 'weapon' | 'armor' | 'accessory') => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  getEquippedStats: () => { strength: number; intelligence: number; agility: number; wisdom: number };
  getInventoryCount: () => number;
  hasItem: (lootId: string) => boolean;
}

// Helper function to calculate sell price
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

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventory: [],
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
      gold: 0,
      
      addItem: (lootItem, quantity = 1) => {
        set((state) => {
          const existingItem = state.inventory.find(
            item => item.lootId === lootItem.id && 
                   item.rarity === lootItem.rarity &&
                   !item.equipped
          );
          
          if (existingItem && (lootItem.slot === 'consumable' || lootItem.slot === 'material')) {
            return {
              inventory: state.inventory.map(item =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          
          const newItem: InventoryItem = {
            id: generateId(),
            lootId: lootItem.id,
            name: lootItem.name,
            rarity: lootItem.rarity,
            slot: lootItem.slot,
            icon: lootItem.icon,
            stats: lootItem.stats || {},
            quantity,
            equipped: false,
            acquiredAt: new Date().toISOString(),
          };
          
          return {
            inventory: [...state.inventory, newItem],
          };
        });
      },
      
      removeItem: (inventoryId, quantity = 1) => {
        set((state) => {
          const item = state.inventory.find(i => i.id === inventoryId);
          if (!item) return state;
          
          if (item.quantity > quantity) {
            return {
              inventory: state.inventory.map(i =>
                i.id === inventoryId
                  ? { ...i, quantity: i.quantity - quantity }
                  : i
              ),
            };
          }
          
          return {
            inventory: state.inventory.filter(i => i.id !== inventoryId),
          };
        });
      },
      
      sellItem: (inventoryId, quantity = 1) => {
        const state = get();
        const item = state.inventory.find(i => i.id === inventoryId);
        if (!item) return 0;
        
        // Calculate sell price
        const pricePerItem = calculateSellPrice(item);
        const actualQuantity = Math.min(quantity, item.quantity);
        const totalGold = pricePerItem * actualQuantity;
        
        console.log(`Selling ${item.name}: ${pricePerItem} gold each x ${actualQuantity} = ${totalGold} total`);
        
        // Remove item from inventory
        get().removeItem(inventoryId, actualQuantity);
        
        // Add gold
        set((state) => ({
          gold: state.gold + totalGold,
        }));
        
        return totalGold;
      },
      
      buyItem: (lootItem, quantity = 1) => {
        const state = get();
        const totalCost = lootItem.buyPrice * quantity;
        
        if (state.gold >= totalCost) {
          set({ gold: state.gold - totalCost });
          get().addItem(lootItem, quantity);
          return true;
        }
        return false;
      },
      
      equipItem: (inventoryId) => {
        set((state) => {
          const item = state.inventory.find(i => i.id === inventoryId);
          if (!item || item.slot === 'consumable' || item.slot === 'material') return state;
          
          const currentEquipped = state.equipment[item.slot];
          let updatedInventory = state.inventory.map(i => {
            if (i.id === inventoryId) {
              return { ...i, equipped: true };
            }
            if (currentEquipped && i.id === currentEquipped.id) {
              return { ...i, equipped: false };
            }
            return i;
          });
          
          return {
            inventory: updatedInventory,
            equipment: {
              ...state.equipment,
              [item.slot]: { ...item, equipped: true },
            },
          };
        });
      },
      
      unequipItem: (slot) => {
        set((state) => {
          const equippedItem = state.equipment[slot];
          if (!equippedItem) return state;
          
          return {
            inventory: state.inventory.map(i =>
              i.id === equippedItem.id ? { ...i, equipped: false } : i
            ),
            equipment: {
              ...state.equipment,
              [slot]: null,
            },
          };
        });
      },
      
      addGold: (amount) => {
        set((state) => ({ gold: state.gold + amount }));
      },
      
      spendGold: (amount) => {
        const state = get();
        if (state.gold >= amount) {
          set({ gold: state.gold - amount });
          return true;
        }
        return false;
      },
      
      getEquippedStats: () => {
        const state = get();
        const stats = { strength: 0, intelligence: 0, agility: 0, wisdom: 0 };
        
        Object.values(state.equipment).forEach(item => {
          if (item?.stats) {
            stats.strength += item.stats.strength || 0;
            stats.intelligence += item.stats.intelligence || 0;
            stats.agility += item.stats.agility || 0;
            stats.wisdom += item.stats.wisdom || 0;
          }
        });
        
        return stats;
      },
      
      getInventoryCount: () => {
        return get().inventory.reduce((total, item) => total + item.quantity, 0);
      },
      
      hasItem: (lootId) => {
        return get().inventory.some(item => item.lootId === lootId);
      },
    }),
    {
      name: 'taskmate-inventory',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inventory: state.inventory,
        equipment: state.equipment,
        gold: state.gold,
      }),
    }
  )
);