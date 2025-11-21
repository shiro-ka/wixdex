import type { Card } from '../types';

// カードタイプの優先順位（ルリグデッキ）
const LRIG_CARD_TYPE_ORDER: Record<string, number> = {
  'ルリグ': 1,
  'アシスト': 2,
  'ピース': 3,
  'アーツ': 4,
};

// カードタイプの優先順位（メインデッキ）
const MAIN_CARD_TYPE_ORDER: Record<string, number> = {
  'シグニ': 1,
  'スペル': 2,
  'サーバント': 3,
};

// 色の優先順位
const COLOR_ORDER: Record<string, number> = {
  '白': 1,
  '赤': 2,
  '青': 3,
  '緑': 4,
  '黒': 5,
  '多色': 6,
  '無色': 7,
};

// カードタイプの優先順位を取得（ルリグデッキ用）
function getLrigCardTypePriority(card: Card): number {
  const cardType = card.cardType?.[0] ?? '';
  return LRIG_CARD_TYPE_ORDER[cardType] ?? 999;
}

// カードタイプの優先順位を取得（メインデッキ用）
function getMainCardTypePriority(card: Card): number {
  const cardType = card.cardType?.[0] ?? '';
  return MAIN_CARD_TYPE_ORDER[cardType] ?? 999;
}

// 色の優先順位を取得
function getColorPriority(card: Card): number {
  const color = card.color?.[0] ?? '無色';
  // 複数色の場合は多色扱い
  if (card.color && card.color.length > 1) {
    return COLOR_ORDER['多色'] ?? 6;
  }
  return COLOR_ORDER[color] ?? 7;
}

// レベルを取得（数値に変換）
function getLevel(card: Card): number {
  const level = card.level;
  if (typeof level === 'number') return level;
  return 0;
}

// ルリグタイプ（アシスト用）を取得して50音順でソート
function getLrigTypeSortKey(card: Card): string {
  const lrigType = card.lrigTypeClass?.[0] ?? '';
  return lrigType;
}

// ルリグデッキをソート
export function sortLrigDeck(lrigDeck: Card[]): Card[] {
  return [...lrigDeck].sort((a, b) => {
    // 1. カードタイプでソート（ルリグ→アシスト→ピース→アーツ）
    const typeDiff = getLrigCardTypePriority(a) - getLrigCardTypePriority(b);
    if (typeDiff !== 0) return typeDiff;

    // 2. ルリグタイプでソート（アシストの場合のみ、50音順）
    const isAssistA = a.cardType?.[0] === 'アシスト';
    const isAssistB = b.cardType?.[0] === 'アシスト';
    if (isAssistA && isAssistB) {
      const lrigTypeDiff = getLrigTypeSortKey(a).localeCompare(getLrigTypeSortKey(b), 'ja');
      if (lrigTypeDiff !== 0) return lrigTypeDiff;

      // 3. レベルでソート（アシストの場合、1→2）
      const levelDiff = getLevel(a) - getLevel(b);
      if (levelDiff !== 0) return levelDiff;
    }

    // 4. IDでソート
    const idA = a.id ?? '';
    const idB = b.id ?? '';
    return idA.localeCompare(idB);
  });
}

// メインデッキをソート
export function sortMainDeck(mainDeck: Card[]): Card[] {
  return [...mainDeck].sort((a, b) => {
    // 1. カードタイプでソート（シグニ→スペル→サーバント）
    const typeDiff = getMainCardTypePriority(a) - getMainCardTypePriority(b);
    if (typeDiff !== 0) return typeDiff;

    // 2. レベルでソート（シグニの場合のみ、1→2→3）
    const isSigniA = a.cardType?.[0] === 'シグニ';
    const isSigniB = b.cardType?.[0] === 'シグニ';
    if (isSigniA && isSigniB) {
      const levelDiff = getLevel(a) - getLevel(b);
      if (levelDiff !== 0) return levelDiff;
    }

    // 3. 色でソート（白→赤→青→緑→黒→多色→無色）
    const colorDiff = getColorPriority(a) - getColorPriority(b);
    if (colorDiff !== 0) return colorDiff;

    // 4. IDでソート
    const idA = a.id ?? '';
    const idB = b.id ?? '';
    return idA.localeCompare(idB);
  });
}
