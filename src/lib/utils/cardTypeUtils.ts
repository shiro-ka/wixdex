import type { Card } from '$lib/types';

const CARD_TYPES = {
  LRIG: ['ルリグ', 'アシスト', 'ピース', 'アーツ'],
  MAIN: ['シグニ', 'スペル', 'サーバント'],
} as const;

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

function primaryType(card: Card): string {
  return card.cardType?.[0] ?? '';
}

export function isLrigCard(card: Card): boolean {
  return CARD_TYPES.LRIG.includes(primaryType(card) as never);
}

export function isMainDeckCard(card: Card): boolean {
  return CARD_TYPES.MAIN.includes(primaryType(card) as never);
}

export function isCenterLrig(card: Card): boolean {
  return primaryType(card) === 'ルリグ';
}

export function isAssist(card: Card): boolean {
  return primaryType(card) === 'アシスト';
}

export function isPiece(card: Card): boolean {
  return primaryType(card) === 'ピース';
}

export function isArts(card: Card): boolean {
  return primaryType(card) === 'アーツ';
}
