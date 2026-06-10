import { encryptObject, decryptObject, isEncrypted } from './encryption';

// Check if encryption is enabled
const isEncryptionEnabled = (): boolean => {
  return localStorage.getItem('taskmate-encryption-enabled') === 'true';
};

// Enable encryption
export const enableEncryption = (): void => {
  localStorage.setItem('taskmate-encryption-enabled', 'true');
};

// Disable encryption (for debugging)
export const disableEncryption = (): void => {
  localStorage.setItem('taskmate-encryption-enabled', 'false');
};

// Wrapper for localStorage with optional encryption
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      if (isEncryptionEnabled()) {
        const encrypted = encryptObject(value);
        localStorage.setItem(key, encrypted);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Failed to store data:', error);
      // Fallback to unencrypted
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Complete storage failure:', e);
      }
    }
  },

  getItem: (key: string): any | null => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      // Check if it's encrypted
      if (isEncrypted(data)) {
        const decrypted = decryptObject(data);
        if (decrypted) return decrypted;
        console.warn('Decryption failed, trying plain JSON');
      }

      // Try parsing as plain JSON
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  // Migrate existing unencrypted data to encrypted
  migrateToEncrypted: (key: string): boolean => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return false;

      // Already encrypted
      if (isEncrypted(data)) return true;

      // Parse and encrypt
      const parsed = JSON.parse(data);
      enableEncryption();
      secureStorage.setItem(key, parsed);
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  },
};