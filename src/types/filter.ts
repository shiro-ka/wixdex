export interface FilterState {
  selectedColors: Set<string>;
  selectedLevels: Set<number>;
  selectedCardTypes: Set<string>;
  selectedLrigClasses: Set<string>;
  lifeBurstFilter: boolean | null;
  searchText: string;
}
