import { useState, useCallback } from 'react';

export function useCardFilter() {
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedLevels, setSelectedLevels] = useState<Set<number>>(new Set());
  const [selectedCardTypes, setSelectedCardTypes] = useState<Set<string>>(new Set());
  const [selectedLrigClasses, setSelectedLrigClasses] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [lifeBurstFilter, setLifeBurstFilter] = useState<boolean | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [candidateFilter, setCandidateFilter] = useState<boolean>(false);

  // 色フィルターのトグル
  const toggleColorFilter = useCallback((color: string) => {
    setSelectedColors(prev => {
      const newColors = new Set(prev);
      if (newColors.has(color)) {
        newColors.delete(color);
      } else {
        newColors.add(color);
      }
      return newColors;
    });
  }, []);

  // レベルフィルターのトグル
  const toggleLevelFilter = useCallback((level: number) => {
    setSelectedLevels(prev => {
      const newLevels = new Set(prev);
      if (newLevels.has(level)) {
        newLevels.delete(level);
      } else {
        newLevels.add(level);
      }
      return newLevels;
    });
  }, []);

  // カード種類フィルターのトグル
  const toggleCardTypeFilter = useCallback((cardType: string) => {
    setSelectedCardTypes(prev => {
      const newTypes = new Set(prev);
      if (newTypes.has(cardType)) {
        newTypes.delete(cardType);
      } else {
        newTypes.add(cardType);
      }
      return newTypes;
    });
  }, []);

  // ルリグクラスフィルターのトグル
  const toggleLrigClassFilter = useCallback((lrigClass: string) => {
    setSelectedLrigClasses(prev => {
      const newClasses = new Set(prev);
      if (newClasses.has(lrigClass)) {
        newClasses.delete(lrigClass);
      } else {
        newClasses.add(lrigClass);
      }
      return newClasses;
    });
  }, []);

  // タグフィルターのトグル
  const toggleTagFilter = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  }, []);

  // ライフバーストフィルターのトグル
  const toggleLifeBurstFilter = useCallback(() => {
    setLifeBurstFilter(prev => {
      if (prev === null) return true;
      if (prev === true) return false;
      return null;
    });
  }, []);

  // 候補カードフィルターのトグル
  const toggleCandidateFilter = useCallback(() => {
    setCandidateFilter(prev => !prev);
  }, []);

  // 全フィルターをリセット
  const resetFilters = useCallback(() => {
    setSelectedColors(new Set());
    setSelectedLevels(new Set());
    setSelectedCardTypes(new Set());
    setSelectedLrigClasses(new Set());
    setSelectedTags(new Set());
    setLifeBurstFilter(null);
    setSearchText('');
    setCandidateFilter(false);
  }, []);

  return {
    selectedColors,
    selectedLevels,
    selectedCardTypes,
    selectedLrigClasses,
    selectedTags,
    lifeBurstFilter,
    searchText,
    candidateFilter,
    setSearchText,
    toggleColorFilter,
    toggleLevelFilter,
    toggleCardTypeFilter,
    toggleLrigClassFilter,
    toggleTagFilter,
    toggleLifeBurstFilter,
    toggleCandidateFilter,
    resetFilters,
  };
}
