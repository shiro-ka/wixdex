import { useState, useCallback } from 'react';

export function useCardFilter() {
  const [selectedColors, setSelectedColors] = useState(new Set());
  const [selectedLevels, setSelectedLevels] = useState(new Set());
  const [selectedCardTypes, setSelectedCardTypes] = useState(new Set());
  const [selectedLrigClasses, setSelectedLrigClasses] = useState(new Set());
  const [lifeBurstFilter, setLifeBurstFilter] = useState(null);
  const [searchText, setSearchText] = useState('');

  // 色フィルターのトグル
  const toggleColorFilter = useCallback((color) => {
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
  const toggleLevelFilter = useCallback((level) => {
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
  const toggleCardTypeFilter = useCallback((cardType) => {
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
  const toggleLrigClassFilter = useCallback((lrigClass) => {
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

  // ライフバーストフィルターのトグル
  const toggleLifeBurstFilter = useCallback(() => {
    setLifeBurstFilter(prev => {
      if (prev === null) return true;
      if (prev === true) return false;
      return null;
    });
  }, []);

  // 全フィルターをリセット
  const resetFilters = useCallback(() => {
    setSelectedColors(new Set());
    setSelectedLevels(new Set());
    setSelectedCardTypes(new Set());
    setSelectedLrigClasses(new Set());
    setLifeBurstFilter(null);
    setSearchText('');
  }, []);

  return {
    selectedColors,
    selectedLevels,
    selectedCardTypes,
    selectedLrigClasses,
    lifeBurstFilter,
    searchText,
    setSearchText,
    toggleColorFilter,
    toggleLevelFilter,
    toggleCardTypeFilter,
    toggleLrigClassFilter,
    toggleLifeBurstFilter,
    resetFilters,
  };
}
