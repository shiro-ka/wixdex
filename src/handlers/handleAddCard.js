import { addCardToDeck } from '../utils/addCardToDeck';

export function handleAddCard(card, mainDeck, lrigDeck, setMainDeck, setLrigDeck) {
  const cardType = card.cardType?.[0] ?? '';
  const updated = addCardToDeck(card, mainDeck, lrigDeck);
  if (!Array.isArray(updated)) return;
  if (['ルリグ', 'アシストルリグ', 'ピース', 'アーツ'].includes(cardType)) {
    setLrigDeck(updated);
  } else {
    setMainDeck(updated);
  }
}