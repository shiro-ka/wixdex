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

/**
 * カードの主種別。構築ルール上の種別は常に cardType の先頭で判定する。
 * (例: ピースだが裏面ルリグのカードは ['ピース', ...] となり「ピース」としてのみ扱う)
 * 先頭が主種別であることはデータ生成側 (convert_cards.py) が保証する。
 */
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
