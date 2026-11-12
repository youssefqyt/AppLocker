import * as SecureStore from 'expo-secure-store';

const KEYS = {
  PIN: 'al_pin',
  APPS: 'al_apps',
  LOG: 'al_log',
  SETTINGS: 'al_settings',
};

export const Storage = {
  async getPin() {
    try {
      return await SecureStore.getItemAsync(KEYS.PIN);
    } catch {
      return null;
    }
  },

  async setPin(pin) {
    try {
      await SecureStore.setItemAsync(KEYS.PIN, pin);
      return true;
    } catch {
      return false;
    }
  },

  async clearPin() {
    try {
      await SecureStore.deleteItemAsync(KEYS.PIN);
      return true;
    } catch {
      return false;
    }
  },

  async getApps() {
    try {
      const raw = await SecureStore.getItemAsync(KEYS.APPS);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async setApps(apps) {
    try {
      await SecureStore.setItemAsync(KEYS.APPS, JSON.stringify(apps));
      return true;
    } catch {
      return false;
    }
  },

  async getLog() {
    try {
      const raw = await SecureStore.getItemAsync(KEYS.LOG);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async setLog(log) {
    try {
      await SecureStore.setItemAsync(KEYS.LOG, JSON.stringify(log));
      return true;
    } catch {
      return false;
    }
  },

  async getSettings() {
    try {
      const raw = await SecureStore.getItemAsync(KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async setSettings(settings) {
    try {
      await SecureStore.setItemAsync(KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch {
      return false;
    }
  },

  async clearAll() {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.PIN),
        SecureStore.deleteItemAsync(KEYS.APPS),
        SecureStore.deleteItemAsync(KEYS.LOG),
        SecureStore.deleteItemAsync(KEYS.SETTINGS),
      ]);
      return true;
    } catch {
      return false;
    }
  },
};

export const DEFAULT_APPS = [
  { id: '1', name: 'Instagram',  category: 'Social',    icon: 'logo-instagram', color: '#833AB4', bgColor: '#2D1435', locked: true  },
  { id: '2', name: 'WhatsApp',   category: 'Messaging', icon: 'logo-whatsapp',  color: '#25D366', bgColor: '#0D2D1A', locked: true  },
  { id: '3', name: 'Gmail',      category: 'Email',     icon: 'mail',           color: '#EA4335', bgColor: '#2D0D0D', locked: false },
  { id: '4', name: 'Chrome',     category: 'Browser',   icon: 'globe-outline',  color: '#4285F4', bgColor: '#0D1E30', locked: false },
  { id: '5', name: 'Snapchat',   category: 'Social',    icon: 'chatbubble',     color: '#FFFC00', bgColor: '#2D2700', locked: true  },
  { id: '6', name: 'TikTok',     category: 'Video',     icon: 'musical-notes',  color: '#FF0050', bgColor: '#1A0D2D', locked: false },
  { id: '7', name: 'Photos',     category: 'Media',     icon: 'images-outline', color: '#34C759', bgColor: '#1A2D0D', locked: false },
  { id: '8', name: 'Banking',    category: 'Finance',   icon: 'card-outline',   color: '#5BB8FF', bgColor: '#0D2040', locked: true  },
  { id: '9', name: 'Twitter/X',  category: 'Social',    icon: 'logo-twitter',   color: '#1DA1F2', bgColor: '#0D1A2D', locked: false },
  { id: '10', name: 'Telegram',  category: 'Messaging', icon: 'paper-plane',    color: '#0088CC', bgColor: '#0D1E30', locked: true  },
  { id: '11', name: 'YouTube',   category: 'Video',     icon: 'logo-youtube',   color: '#FF0000', bgColor: '#2D0D0D', locked: false },
  { id: '12', name: 'Settings',  category: 'System',    icon: 'settings-outline',color:'#8B8FAD', bgColor: '#1E1E1E', locked: false },
];

export const DEFAULT_SETTINGS = {
  biometrics: false,
  notifications: true,
  autoLock: '1 min',
  maxAttempts: 5,
  hideContent: true,
  theme: 'dark',
};

export function generatePinSuggestions() {
  const suggestions = [];
  for (let i = 0; i < 3; i++) {
    let pin = '';
    for (let j = 0; j < 4; j++) {
      pin += Math.floor(Math.random() * 10).toString();
    }
    const repeats = new Set(pin.split('')).size < 2;
    const sequential = isSequential(pin);
    const strength = (!repeats && !sequential) ? 'Strong' : 'Medium';
    suggestions.push({ pin, strength, desc: 'Random · auto-generated' });
  }
  return suggestions;
}

function isSequential(pin) {
  const digits = pin.split('').map(Number);
  let asc = true, desc = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) asc = false;
    if (digits[i] !== digits[i - 1] - 1) desc = false;
  }
  return asc || desc;
}
