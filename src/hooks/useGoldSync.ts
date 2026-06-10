import { useEffect } from 'react';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useUserStore } from '../stores/useUserStore';

// This hook syncs gold between inventory store and user store
export const useGoldSync = () => {
  useEffect(() => {
    // When inventory gold changes, update user gold
    const unsubscribe = useInventoryStore.subscribe((state) => {
      const userStore = useUserStore.getState();
      if (userStore.user) {
        // Only update if different to avoid infinite loops
        if (userStore.user.gold !== state.gold) {
          useUserStore.setState({
            user: {
              ...userStore.user,
              gold: state.gold,
            },
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize inventory gold from user gold on first load
  useEffect(() => {
    const userStore = useUserStore.getState();
    const inventoryStore = useInventoryStore.getState();
    
    if (userStore.user && inventoryStore.gold === 0 && userStore.user.gold > 0) {
      // If user has gold but inventory doesn't, sync from user to inventory
      useInventoryStore.setState({ gold: userStore.user.gold });
    } else if (userStore.user && userStore.user.gold !== inventoryStore.gold) {
      // Keep them in sync
      useUserStore.setState({
        user: {
          ...userStore.user,
          gold: inventoryStore.gold,
        },
      });
    }
  }, []);
};