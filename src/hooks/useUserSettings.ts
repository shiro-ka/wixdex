import { useState, useCallback, useEffect } from 'react';

const SETTINGS_STORAGE_KEY = 'wixdex_user_settings';

interface UserSettings {
  showLifeBurst: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  showLifeBurst: false,
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // 設定をローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save user settings:', error);
    }
  }, [settings]);

  const toggleShowLifeBurst = useCallback(() => {
    setSettings(prev => ({ ...prev, showLifeBurst: !prev.showLifeBurst }));
  }, []);

  return {
    settings,
    toggleShowLifeBurst,
  };
}
