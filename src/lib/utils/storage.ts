import type { Card } from '$lib/types';

const SETTINGS_KEY = 'wixdex_user_settings';
const DRAFT_KEY = 'wixdex_draft';

export interface UserSettings {
  showLifeBurst: boolean;
  showCandidateIcon: boolean;
  rotateLandscape: boolean;
}

export interface DraftState {
  currentDeckId: string | null;
  currentDeckName: string;
  currentDeckMemo: string;
  currentDeckSlug?: string;
  isPublic: boolean;
  mainDeck: Card[];
  lrigDeck: Card[];
  candidateCards: Card[];
}

const DEFAULT_SETTINGS: UserSettings = {
  showLifeBurst: false,
  showCandidateIcon: false,
  rotateLandscape: false,
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
  } catch {}
}

export const getSettings = (): UserSettings => ({ ...DEFAULT_SETTINGS, ...read<Partial<UserSettings>>(SETTINGS_KEY, {}) });
export const saveSettings = (settings: UserSettings): void => write(SETTINGS_KEY, settings);

export const getDraft = (): DraftState | null => read<DraftState | null>(DRAFT_KEY, null);
export const saveDraft = (draft: DraftState): void => write(DRAFT_KEY, draft);
export const clearDraft = (): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(DRAFT_KEY);
};
