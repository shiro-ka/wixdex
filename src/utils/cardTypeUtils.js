// カードタイプの定義
export const CARD_TYPES = {
  LRIG: ['ルリグ', 'アシスト', 'ピース', 'アーツ'],
  MAIN: ['シグニ', 'スペル', 'サーバント'],
};

// デッキの上限
export const DECK_LIMITS = {
  LRIG: 8,
  MAIN: 40,
  SAME_NAME: 4,
};

// カードがルリグデッキに入るかどうか
export function isLrigCard(card) {
  const cardType = card.cardType?.[0] ?? '';
  return CARD_TYPES.LRIG.includes(cardType);
}

// カードがメインデッキに入るかどうか
export function isMainDeckCard(card) {
  const cardType = card.cardType?.[0] ?? '';
  return CARD_TYPES.MAIN.includes(cardType);
}
