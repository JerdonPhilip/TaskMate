// Simple but effective encryption for client-side data
const SALT = 'TM_SALT_2024';
const SECRET = 'TM_SECRET_v1';

// XOR encryption with salt (simple but effective for client-side)
const xorEncrypt = (text: string, key: string): string => {
  let result = '';
  const combinedKey = key + SALT;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ combinedKey.charCodeAt(i % combinedKey.length);
    result += String.fromCharCode(charCode);
  }
  return result;
};

// Convert to base64 safely
const toBase64 = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
};

// Convert from base64 safely
const fromBase64 = (str: string): string => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return atob(str);
  }
};

// Generate checksum
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

// Encrypt a string
export const encrypt = (data: string, customKey?: string): string => {
  if (!data) return '';
  
  const key = customKey || SECRET;
  const checksum = generateChecksum(data);
  
  // Create payload with checksum
  const payload = JSON.stringify({
    data: data,
    checksum: checksum,
    timestamp: Date.now(),
  });
  
  // Encrypt the payload
  const encrypted = xorEncrypt(payload, key);
  
  // Return as base64 with version marker
  const final = JSON.stringify({
    v: 2,
    d: toBase64(encrypted),
  });
  
  return final;
};

// Decrypt a string
export const decrypt = (encryptedData: string, customKey?: string): string | null => {
  if (!encryptedData) return null;
  
  try {
    const key = customKey || SECRET;
    
    // Parse the outer wrapper
    let wrapper;
    try {
      wrapper = JSON.parse(encryptedData);
    } catch {
      // Try as base64 directly (old format)
      try {
        const decoded = fromBase64(encryptedData);
        wrapper = JSON.parse(decoded);
      } catch {
        return null;
      }
    }
    
    // Check version
    if (!wrapper.v || !wrapper.d) {
      return null;
    }
    
    // Decode from base64
    const decoded = fromBase64(wrapper.d);
    
    // Decrypt
    const decrypted = xorEncrypt(decoded, key);
    
    // Parse payload
    let payload;
    try {
      payload = JSON.parse(decrypted);
    } catch {
      return null;
    }
    
    // Verify checksum
    if (payload.data && payload.checksum) {
      const computedChecksum = generateChecksum(payload.data);
      if (computedChecksum === payload.checksum) {
        return payload.data;
      }
    }
    
    // If no checksum (old format), just return the data
    if (payload.data) {
      return payload.data;
    }
    
    return null;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Encrypt an object
export const encryptObject = (obj: any, customKey?: string): string => {
  try {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString, customKey);
  } catch (error) {
    console.error('Encryption failed:', error);
    return JSON.stringify(obj); // Fallback to plain
  }
};

// Decrypt to object
export const decryptObject = (encryptedData: string, customKey?: string): any | null => {
  try {
    const jsonString = decrypt(encryptedData, customKey);
    if (!jsonString) return null;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decrypt object failed:', error);
    return null;
  }
};

// Check if data is encrypted (our format)
export const isEncrypted = (data: string): boolean => {
  if (!data) return false;
  try {
    const parsed = JSON.parse(data);
    return parsed && parsed.v !== undefined && parsed.d !== undefined;
  } catch {
    return false;
  }
};