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
  LRIG_SAME_NAME: 1,
  CENTER: 1,
  ASSIST: 4,
  PIECE: 2,
  ARTS: 6,
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

// カードタイプ判定ヘルパー関数
export function isCenterLrig(card) {
  return card.cardType?.includes('ルリグ');
}

export function isAssist(card) {
  return card.cardType?.includes('アシスト');
}

export function isPiece(card) {
  return card.cardType?.includes('ピース');
}

export function isArts(card) {
  return card.cardType?.includes('アーツ');
}
