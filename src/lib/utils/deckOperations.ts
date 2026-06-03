import type { Card, DeckOperationResult, DeckType } from '$lib/types';
import { isLrigCard, isMainDeckCard } from './cardTypeUtils';
import { canAddCard } from './deckValidation';
import { sortLrigDeck, sortMainDeck } from './cardSorting';

export function addCardToDeck(card: Card, mainDeck: Card[], lrigDeck: Card[]): DeckOperationResult {
  const validation = canAddCard(card, mainDeck, lrigDeck);
  if (!validation.valid) {
    console.warn(validation.error);
    return { mainDeck, lrigDeck };
  }
  if (isLrigCard(card)) {
    return { mainDeck, lrigDeck: sortLrigDeck([...lrigDeck, card]) };
  }
  if (isMainDeckCard(card)) {
    return { mainDeck: sortMainDeck([...mainDeck, card]), lrigDeck };
  }
  return { mainDeck, lrigDeck };
}

export function addMultipleCardsToDeck(
  card: Card, count: number, mainDeck: Card[], lrigDeck: Card[]
): DeckOperationResult {
  let newMainDeck = [...mainDeck];
  let newLrigDeck = [...lrigDeck];
  let addedCount = 0;

  for (let i = 0; i < count; i++) {
    const validation = canAddCard(card, newMainDeck, newLrigDeck);
    if (!validation.valid) {
      if (addedCount > 0) console.warn(`${addedCount}枚追加しました: ${validation.error}`);
      else console.warn(validation.error);
      break;
    }
    if (isLrigCard(card)) { newLrigDeck = [...newLrigDeck, card]; addedCount++; }
    else if (isMainDeckCard(card)) { newMainDeck = [...newMainDeck, card]; addedCount++; }
    else break;
  }

  if (addedCount > 0) {
    if (isLrigCard(card)) newLrigDeck = sortLrigDeck(newLrigDeck);
    else if (isMainDeckCard(card)) newMainDeck = sortMainDeck(newMainDeck);
  }
  return { mainDeck: newMainDeck, lrigDeck: newLrigDeck };
}

export function removeCardFromDeck(
  card: Card, mainDeck: Card[], lrigDeck: Card[],
  specificIndex: number | null = null, deckType: DeckType | null = null
): DeckOperationResult {
  if (specificIndex !== null && deckType !== null) {
    if (deckType === 'lrig' && specificIndex >= 0 && specificIndex < lrigDeck.length) {
      const newLrigDeck = [...lrigDeck];
      newLrigDeck.splice(specificIndex, 1);
      return { mainDeck, lrigDeck: newLrigDeck };
    }
    if (deckType === 'main' && specificIndex >= 0 && specificIndex < mainDeck.length) {
      const newMainDeck = [...mainDeck];
      newMainDeck.splice(specificIndex, 1);
      return { mainDeck: newMainDeck, lrigDeck };
    }
    return { mainDeck, lrigDeck };
  }
  if (isLrigCard(card)) {
    const index = lrigDeck.findIndex(c => c.cardID === card.cardID);
    if (index !== -1) {
      const newLrigDeck = [...lrigDeck];
      newLrigDeck.splice(index, 1);
      return { mainDeck, lrigDeck: newLrigDeck };
    }
    return { mainDeck, lrigDeck };
  }
  if (isMainDeckCard(card)) {
    const index = mainDeck.findIndex(c => c.cardID === card.cardID);
    if (index !== -1) {
      const newMainDeck = [...mainDeck];
      newMainDeck.splice(index, 1);
      return { mainDeck: newMainDeck, lrigDeck };
    }
    return { mainDeck, lrigDeck };
  }
  return { mainDeck, lrigDeck };
}
