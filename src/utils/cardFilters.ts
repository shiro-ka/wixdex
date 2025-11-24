import type { Card, FilterState } from '../types';

/**
 * カードをフィルタリングする
 */
export function filterCards(cards: Card[], filters: FilterState): Card[] {
  const {
    selectedColors,
    selectedLevels,
    selectedCardTypes,
    selectedLrigClasses,
    selectedTags,
    lifeBurstFilter,
    searchText,
    candidateFilter,
    candidateCards,
    favoriteFilter,
    favoriteCards,
  } = filters;

  return cards.filter(card => {
    // お気に入りカードフィルター（最優先）
    if (favoriteFilter && favoriteCards) {
      const inFavorites = favoriteCards.some(c =>
        (c.id && c.id === card.id) || (c.image === card.image)
      );
      if (!inFavorites) return false;
    }

    // 候補カードフィルター（次に優先）
    if (candidateFilter && candidateCards) {
      const inCandidates = candidateCards.some(c => c.id === card.id);
      if (!inCandidates) return false;
    }

    // 色によるフィルタリング
    const colorMatch = selectedColors.size === 0 ||
      card.color.some(color => selectedColors.has(color));

    // レベルによるフィルタリング
    const levelMatch = selectedLevels.size === 0 ||
      selectedLevels.has(card.level);

    // カード種類によるフィルタリング
    const cardTypeMatch = selectedCardTypes.size === 0 ||
      card.cardType.some(type => selectedCardTypes.has(type));

    // ルリグクラスによるフィルタリング
    const lrigClassMatch = selectedLrigClasses.size === 0 ||
      card.lrigTypeClass.some(lrigClass => selectedLrigClasses.has(lrigClass));

    // タグによるフィルタリング
    const tagMatch = selectedTags.size === 0 ||
      (Array.isArray(card.tags) ? card.tags.some(tag => selectedTags.has(tag)) :
       typeof card.tags === 'string' && card.tags !== '' && selectedTags.has(card.tags));

    // ライフバーストによるフィルタリング
    const lifeBurstMatch = lifeBurstFilter === null ||
      card.lifeBurst === lifeBurstFilter.toString();

    // テキストによるフィルタリング
    const textMatch = searchText === '' ||
      card.name.toLowerCase().includes(searchText.toLowerCase()) ||
      card.subName.some(name => name.toLowerCase().includes(searchText.toLowerCase()));

    // 全ての条件を満たすカードのみを表示
    return colorMatch && levelMatch && cardTypeMatch && lrigClassMatch && tagMatch && lifeBurstMatch && textMatch;
  });
}
