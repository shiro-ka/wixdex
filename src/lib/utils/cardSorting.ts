import type { Card } from '$lib/types';
import { cardKey } from './cardData';

const LRIG_CARD_TYPE_ORDER: Record<string, number> = {
  'ルリグ': 1, 'アシスト': 2, 'ピース': 3, 'アーツ': 4,
};
const MAIN_CARD_TYPE_ORDER: Record<string, number> = {
  'シグニ': 1, 'スペル': 2, 'サーバント': 3,
};
const COLOR_ORDER: Record<string, number> = {
  '白': 1, '赤': 2, '青': 3, '緑': 4, '黒': 5, '多色': 6, '無': 7,
};

/** カードの読み込み順(=発売順)インデックス。orderMap 未指定や未収録は末尾扱い。 */
function getOrderIndex(card: Card, orderMap?: Map<string, number>): number {
  if (!orderMap) return Number.MAX_SAFE_INTEGER;
  const key = cardKey(card);
  return (key !== null ? orderMap.get(key) : undefined) ?? Number.MAX_SAFE_INTEGER;
}
const CANDIDATE_CARD_TYPE_ORDER: Record<string, number> = {
  'ルリグ': 1, 'アシスト': 2, 'ピース': 3, 'アーツ': 4,
  'シグニ': 5, 'スペル': 6, 'サーバント': 7,
};

function getLrigCardTypePriority(card: Card): number {
  return LRIG_CARD_TYPE_ORDER[card.cardType?.[0] ?? ''] ?? 999;
}
function getMainCardTypePriority(card: Card): number {
  return MAIN_CARD_TYPE_ORDER[card.cardType?.[0] ?? ''] ?? 999;
}
function getCandidateCardTypePriority(card: Card): number {
  return CANDIDATE_CARD_TYPE_ORDER[card.cardType?.[0] ?? ''] ?? 999;
}
function getColorPriority(card: Card): number {
  if (card.color && card.color.length > 1) return COLOR_ORDER['多色'] ?? 6;
  return COLOR_ORDER[card.color?.[0] ?? '無'] ?? 7;
}
function getLevel(card: Card): number {
  return typeof card.level === 'number' ? card.level : 0;
}
function getLrigTypeSortKey(card: Card): string {
  return card.lrigTypeClass?.[0] ?? '';
}

export function sortLrigDeck(lrigDeck: Card[], orderMap?: Map<string, number>): Card[] {
  return [...lrigDeck].map((card, index) => ({ card, index })).sort((a, b) => {
    const typeDiff = getLrigCardTypePriority(a.card) - getLrigCardTypePriority(b.card);
    if (typeDiff !== 0) return typeDiff;
    if (a.card.cardType?.[0] === 'アシスト' && b.card.cardType?.[0] === 'アシスト') {
      const lrigTypeDiff = getLrigTypeSortKey(a.card).localeCompare(getLrigTypeSortKey(b.card), 'ja');
      if (lrigTypeDiff !== 0) return lrigTypeDiff;
      const levelDiff = getLevel(a.card) - getLevel(b.card);
      if (levelDiff !== 0) return levelDiff;
    }
    const orderDiff = getOrderIndex(a.card, orderMap) - getOrderIndex(b.card, orderMap);
    if (orderDiff !== 0) return orderDiff;
    const idDiff = (a.card.cardID ?? '').localeCompare(b.card.cardID ?? '');
    if (idDiff !== 0) return idDiff;
    return a.index - b.index;
  }).map(item => item.card);
}

export function sortMainDeck(mainDeck: Card[], orderMap?: Map<string, number>): Card[] {
  return [...mainDeck].map((card, index) => ({ card, index })).sort((a, b) => {
    const typeDiff = getMainCardTypePriority(a.card) - getMainCardTypePriority(b.card);
    if (typeDiff !== 0) return typeDiff;
    if (a.card.cardType?.[0] === 'シグニ' && b.card.cardType?.[0] === 'シグニ') {
      const levelDiff = getLevel(a.card) - getLevel(b.card);
      if (levelDiff !== 0) return levelDiff;
    }
    const colorDiff = getColorPriority(a.card) - getColorPriority(b.card);
    if (colorDiff !== 0) return colorDiff;
    const orderDiff = getOrderIndex(a.card, orderMap) - getOrderIndex(b.card, orderMap);
    if (orderDiff !== 0) return orderDiff;
    const idDiff = (a.card.cardID ?? '').localeCompare(b.card.cardID ?? '');
    if (idDiff !== 0) return idDiff;
    return a.index - b.index;
  }).map(item => item.card);
}

export function sortCandidateCards(candidateCards: Card[], orderMap?: Map<string, number>): Card[] {
  return [...candidateCards].map((card, index) => ({ card, index })).sort((a, b) => {
    const typeDiff = getCandidateCardTypePriority(a.card) - getCandidateCardTypePriority(b.card);
    if (typeDiff !== 0) return typeDiff;
    const cardTypeA = a.card.cardType?.[0] ?? '';
    const cardTypeB = b.card.cardType?.[0] ?? '';
    if (cardTypeA === 'アシスト' && cardTypeB === 'アシスト') {
      const lrigTypeDiff = getLrigTypeSortKey(a.card).localeCompare(getLrigTypeSortKey(b.card), 'ja');
      if (lrigTypeDiff !== 0) return lrigTypeDiff;
      const levelDiff = getLevel(a.card) - getLevel(b.card);
      if (levelDiff !== 0) return levelDiff;
    }
    if (cardTypeA === 'シグニ' && cardTypeB === 'シグニ') {
      const levelDiff = getLevel(a.card) - getLevel(b.card);
      if (levelDiff !== 0) return levelDiff;
      const colorDiff = getColorPriority(a.card) - getColorPriority(b.card);
      if (colorDiff !== 0) return colorDiff;
    }
    if ((cardTypeA === 'スペル' || cardTypeA === 'サーバント') && cardTypeA === cardTypeB) {
      const colorDiff = getColorPriority(a.card) - getColorPriority(b.card);
      if (colorDiff !== 0) return colorDiff;
    }
    const orderDiff = getOrderIndex(a.card, orderMap) - getOrderIndex(b.card, orderMap);
    if (orderDiff !== 0) return orderDiff;
    const idDiff = (a.card.cardID ?? '').localeCompare(b.card.cardID ?? '');
    if (idDiff !== 0) return idDiff;
    return a.index - b.index;
  }).map(item => item.card);
}
