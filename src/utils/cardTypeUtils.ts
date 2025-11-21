import type { Card } from '../types';

// カードタイプの定義
export const CARD_TYPES = {
  LRIG: ['ルリグ', 'アシスト', 'ピース', 'アーツ'],
  MAIN: ['シグニ', 'スペル', 'サーバント'],
} as const;

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
} as const;

// カードがルリグデッキに入るかどうか
export function isLrigCard(card: Card): boolean {
  const cardType = card.cardType?.[0] ?? '';
  return CARD_TYPES.LRIG.includes(cardType);
}

// カードがメインデッキに入るかどうか
export function isMainDeckCard(card: Card): boolean {
  const cardType = card.cardType?.[0] ?? '';
  return CARD_TYPES.MAIN.includes(cardType);
}

// カードタイプ判定ヘルパー関数
export function isCenterLrig(card: Card): boolean {
  return card.cardType?.includes('ルリグ') ?? false;
}

export function isAssist(card: Card): boolean {
  return card.cardType?.includes('アシスト') ?? false;
}

export function isPiece(card: Card): boolean {
  return card.cardType?.includes('ピース') ?? false;
}

export function isArts(card: Card): boolean {
  return card.cardType?.includes('アーツ') ?? false;
}
