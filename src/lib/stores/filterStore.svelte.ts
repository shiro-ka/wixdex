import type { Card } from '$lib/types';
import { filterCards } from '$lib/utils/cardFilters';

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const s = new Set(set);
  if (s.has(value)) s.delete(value);
  else s.add(value);
  return s;
}

/**
 * カード検索フィルタの状態とトグル操作をまとめた Svelte 5 ストア。
 * 候補カード・お気に入りは別ストア管理なので apply() の引数で受け取る。
 */
export class FilterStore {
  selectedColors = $state<Set<string>>(new Set());
  selectedLevels = $state<Set<number>>(new Set());
  selectedCardTypes = $state<Set<string>>(new Set());
  selectedLrigClasses = $state<Set<string>>(new Set());
  selectedTags = $state<Set<string>>(new Set());
  lifeBurstFilter = $state<boolean | null>(null);
  searchText = $state('');
  searchName = $state(true);
  searchInText = $state(false);
  candidateFilter = $state(false);
  favoriteFilter = $state(false);

  toggleColor = (color: string) => {
    this.selectedColors = toggleInSet(this.selectedColors, color);
  };
  toggleLevel = (level: number) => {
    this.selectedLevels = toggleInSet(this.selectedLevels, level);
  };
  toggleCardType = (type: string) => {
    this.selectedCardTypes = toggleInSet(this.selectedCardTypes, type);
  };
  toggleLrigClass = (lrigClass: string) => {
    this.selectedLrigClasses = toggleInSet(this.selectedLrigClasses, lrigClass);
  };
  toggleTag = (tag: string) => {
    this.selectedTags = toggleInSet(this.selectedTags, tag);
  };

  clearCardTypes = () => {
    this.selectedCardTypes = new Set();
  };
  clearLrigClasses = () => {
    this.selectedLrigClasses = new Set();
  };
  clearTags = () => {
    this.selectedTags = new Set();
  };

  toggleLifeBurst = () => {
    if (this.lifeBurstFilter === null) this.lifeBurstFilter = true;
    else if (this.lifeBurstFilter === true) this.lifeBurstFilter = false;
    else this.lifeBurstFilter = null;
  };

  setSearchText = (text: string) => {
    this.searchText = text;
  };
  toggleSearchName = () => {
    this.searchName = !this.searchName;
  };
  toggleSearchInText = () => {
    this.searchInText = !this.searchInText;
  };
  toggleCandidate = () => {
    this.candidateFilter = !this.candidateFilter;
  };
  toggleFavorite = () => {
    this.favoriteFilter = !this.favoriteFilter;
  };

  reset = () => {
    this.selectedColors = new Set();
    this.selectedLevels = new Set();
    this.selectedCardTypes = new Set();
    this.selectedLrigClasses = new Set();
    this.selectedTags = new Set();
    this.lifeBurstFilter = null;
    this.searchText = '';
    this.candidateFilter = false;
    this.favoriteFilter = false;
  };

  /** 現在のフィルタ条件でカード配列を絞り込む（候補・お気に入りは外部から注入）。 */
  apply(cards: Card[], candidateCards: Card[], favoriteIds: Set<string>): Card[] {
    return filterCards(cards, {
      selectedColors: this.selectedColors,
      selectedLevels: this.selectedLevels,
      selectedCardTypes: this.selectedCardTypes,
      selectedLrigClasses: this.selectedLrigClasses,
      selectedTags: this.selectedTags,
      lifeBurstFilter: this.lifeBurstFilter,
      searchText: this.searchText,
      searchName: this.searchName,
      searchInText: this.searchInText,
      candidateFilter: this.candidateFilter,
      candidateCards,
      favoriteFilter: this.favoriteFilter,
      favoriteIds,
    });
  }
}
