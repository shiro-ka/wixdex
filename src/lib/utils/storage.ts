import type { SavedDeck } from '$lib/types';

const DECKS_KEY = 'wixdex_saved_decks';
const SETTINGS_KEY = 'wixdex_user_settings';

export interface UserSettings {
  showLifeBurst: boolean;
  showCandidateIcon: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  showLifeBurst: false,
  showCandidateIcon: false,
};

function read<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or disabled */
  }
}

export const getAllDecks = (): SavedDeck[] => read<SavedDeck[]>(DECKS_KEY, []);
export const persistDecks = (decks: SavedDeck[]): void => write(DECKS_KEY, decks);

export const getSettings = (): UserSettings => ({ ...DEFAULT_SETTINGS, ...read<Partial<UserSettings>>(SETTINGS_KEY, {}) });
export const saveSettings = (settings: UserSettings): void => write(SETTINGS_KEY, settings);
