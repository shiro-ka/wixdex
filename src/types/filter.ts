import type { Card } from './card';

export interface FilterState {
  selectedColors: Set<string>;
  selectedLevels: Set<number>;
  selectedCardTypes: Set<string>;
  selectedLrigClasses: Set<string>;
  selectedTags: Set<string>;
  lifeBurstFilter: boolean | null;
  searchText: string;
  candidateFilter: boolean;
  candidateCards?: Card[];
  favoriteFilter: boolean;
  favoriteCards?: Card[];
}
