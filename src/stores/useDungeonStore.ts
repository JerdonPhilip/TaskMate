import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  DungeonScenario, 
  DungeonChoice, 
  DungeonResult,
  generateDungeonScenario, 
  resolveChoice 
} from '../services/dungeonEngine';
import { DUNGEON_TYPES, DungeonType } from '../utils/dungeonTypes';

interface DungeonState {
  // Dungeon State
  isExploring: boolean;
  currentDungeon: DungeonType | null;
  currentScenario: DungeonScenario | null;
  currentResult: DungeonResult | null;
  isGenerating: boolean;
  explorationHistory: ExplorationRecord[];
  totalDungeonsExplored: number;
  totalBossesDefeated: number;
  
  // Actions
  startExploration: (dungeonId: string, playerLevel: number, playerClass: string, stats: any) => Promise<void>;
  makeChoice: (choice: DungeonChoice, stats: any) => Promise<void>;
  endExploration: () => void;
  getAvailableDungeons: (playerLevel: number) => DungeonType[];
  getDungeonStats: () => { explored: number; bosses: number; favorite: string };
}

interface ExplorationRecord {
  id: string;
  dungeonName: string;
  scenarioTitle: string;
  choice: string;
  result: DungeonResult;
  timestamp: string;
}

export const useDungeonStore = create<DungeonState>()(
  persist(
    (set, get) => ({
      isExploring: false,
      currentDungeon: null,
      currentScenario: null,
      currentResult: null,
      isGenerating: false,
      explorationHistory: [],
      totalDungeonsExplored: 0,
      totalBossesDefeated: 0,
      
      startExploration: async (dungeonId, playerLevel, _playerClass, _stats) => {
        const dungeon = DUNGEON_TYPES.find(d => d.id === dungeonId);
        if (!dungeon) return;
        
        set({ isGenerating: true, currentDungeon: dungeon, currentResult: null });
        
        try {
          const scenario = await generateDungeonScenario(
            playerLevel,
            _playerClass,
            dungeon.name
          );
          
          set({ 
            currentScenario: scenario, 
            isExploring: true, 
            isGenerating: false,
            totalDungeonsExplored: get().totalDungeonsExplored + 1,
          });
        } catch (error) {
          console.error('Failed to generate scenario:', error);
          set({ isGenerating: false });
        }
      },
      
      makeChoice: async (choice, stats) => {
        const { currentScenario } = get();
        if (!currentScenario) return;
        
        set({ isGenerating: true });
        
        try {
          const result = await resolveChoice(currentScenario, choice, stats);
          
          set((state) => ({
            currentResult: result,
            isGenerating: false,
            totalBossesDefeated: result.success 
              ? state.totalBossesDefeated + 1 
              : state.totalBossesDefeated,
            explorationHistory: [
              {
                id: Date.now().toString(),
                dungeonName: state.currentDungeon?.name || 'Unknown',
                scenarioTitle: currentScenario.title,
                choice: choice.text,
                result,
                timestamp: new Date().toISOString(),
              },
              ...state.explorationHistory,
            ].slice(0, 50),
          }));
        } catch (error) {
          console.error('Failed to resolve choice:', error);
          set({ isGenerating: false });
        }
      },
      
      endExploration: () => {
        set({
          isExploring: false,
          currentDungeon: null,
          currentScenario: null,
          currentResult: null,
          isGenerating: false,
        });
      },
      
      getAvailableDungeons: (playerLevel) => {
        return DUNGEON_TYPES.filter(d => playerLevel >= d.minLevel);
      },
      
      getDungeonStats: () => {
        const state = get();
        const history = state.explorationHistory;
        
        // Find favorite dungeon
        const dungeonCounts: Record<string, number> = {};
        history.forEach(h => {
          dungeonCounts[h.dungeonName] = (dungeonCounts[h.dungeonName] || 0) + 1;
        });
        
        let favorite = 'None';
        let maxCount = 0;
        Object.entries(dungeonCounts).forEach(([name, count]) => {
          if (count > maxCount) {
            maxCount = count;
            favorite = name;
          }
        });
        
        return {
          explored: state.totalDungeonsExplored,
          bosses: state.totalBossesDefeated,
          favorite,
        };
      },
    }),
    {
      name: 'taskmate-dungeon',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        explorationHistory: state.explorationHistory,
        totalDungeonsExplored: state.totalDungeonsExplored,
        totalBossesDefeated: state.totalBossesDefeated,
      }),
    }
  )
);