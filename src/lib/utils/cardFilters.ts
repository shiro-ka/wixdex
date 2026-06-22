import type { Card, FilterState } from '$lib/types';

const isSameCard = (card1: Card, card2: Card): boolean => {
  return (!!card1.cardID && card1.cardID === card2.cardID) || (card1.image === card2.image);
};

export function filterCards(cards: Card[], filters: FilterState): Card[] {
  const {
    selectedColors,
    selectedLevels,
    selectedCardTypes,
    selectedLrigClasses,
    selectedTags,
    lifeBurstFilter,
    searchText,
    searchName,
    searchInText,
    candidateFilter,
    candidateCards,
    favoriteFilter,
    favoriteIds,
  } = filters;

  const query = searchText.trim().toLowerCase();

  return cards.filter(card => {
    if (favoriteFilter) {
      if (!card.cardID || !favoriteIds?.has(card.cardID)) return false;
    }

    if (candidateFilter && candidateCards) {
      if (!candidateCards.some(c => isSameCard(c, card))) return false;
    }

    const colorMatch = selectedColors.size === 0 ||
      card.color.some(color => selectedColors.has(color));

    const levelMatch = selectedLevels.size === 0 ||
      (card.level !== null && selectedLevels.has(card.level));

    const cardTypeMatch = selectedCardTypes.size === 0 ||
      card.cardType.some(type => selectedCardTypes.has(type));

    const lrigClassMatch = selectedLrigClasses.size === 0 ||
      (card.lrigTypeClass ?? []).some(lrigClass => selectedLrigClasses.has(lrigClass));

    const tagMatch = selectedTags.size === 0 ||
      card.tags.some(tag => selectedTags.has(tag));

    const lifeBurstMatch = lifeBurstFilter === null ||
      card.lifeBurst === lifeBurstFilter;

    // 検索対象が両方OFFのときは入力を無視する(0件トラップを防ぐ)
    let textMatch = query === '' || (!searchName && !searchInText);
    if (!textMatch && searchName) {
      textMatch = card.name.toLowerCase().includes(query) ||
        card.subName.some(name => name.toLowerCase().includes(query));
    }
    if (!textMatch && searchInText) {
      textMatch = card.text.some(t => t.body.toLowerCase().includes(query));
    }

    return colorMatch && levelMatch && cardTypeMatch && lrigClassMatch && tagMatch && lifeBurstMatch && textMatch;
  });
}
