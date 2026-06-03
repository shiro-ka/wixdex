import type { Card } from './card';

export interface FilterState {
  selectedColors: Set<string>;
  selectedLevels: Set<number>;
  selectedCardTypes: Set<string>;
  selectedLrigClasses: Set<string>;
  selectedTags: Set<string>;
  lifeBurstFilter: boolean | null;
  searchText: string;
  /** カード名・読み・略称を検索対象にする */
  searchName: boolean;
  /** カードテキスト本文を検索対象にする */
  searchInText: boolean;
  candidateFilter: boolean;
  candidateCards?: Card[];
  favoriteFilter: boolean;
  favoriteIds?: Set<string>;
}
