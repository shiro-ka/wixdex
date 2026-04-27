import type { Card, FilterState } from '$lib/types';

const isSameCard = (card1: Card, card2: Card): boolean => {
  return (!!card1.id && card1.id === card2.id) || (card1.image === card2.image);
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
    candidateFilter,
    candidateCards,
    favoriteFilter,
    favoriteIds,
  } = filters;

  return cards.filter(card => {
    if (favoriteFilter) {
      if (!card.id || !favoriteIds?.has(card.id)) return false;
    }

    if (candidateFilter && candidateCards) {
      if (!candidateCards.some(c => isSameCard(c, card))) return false;
    }

    const colorMatch = selectedColors.size === 0 ||
      card.color.some(color => selectedColors.has(color));

    const levelMatch = selectedLevels.size === 0 ||
      selectedLevels.has(card.level);

    const cardTypeMatch = selectedCardTypes.size === 0 ||
      card.cardType.some(type => selectedCardTypes.has(type));

    const lrigClassMatch = selectedLrigClasses.size === 0 ||
      card.lrigTypeClass.some(lrigClass => selectedLrigClasses.has(lrigClass));

    const tagMatch = selectedTags.size === 0 ||
      (Array.isArray(card.tags) ? card.tags.some(tag => selectedTags.has(tag)) :
       typeof card.tags === 'string' && card.tags !== '' && selectedTags.has(card.tags));

    const lifeBurstMatch = lifeBurstFilter === null ||
      card.lifeBurst === lifeBurstFilter.toString();

    const textMatch = searchText === '' ||
      card.name.toLowerCase().includes(searchText.toLowerCase()) ||
      card.subName.some(name => name.toLowerCase().includes(searchText.toLowerCase()));

    return colorMatch && levelMatch && cardTypeMatch && lrigClassMatch && tagMatch && lifeBurstMatch && textMatch;
  });
}
