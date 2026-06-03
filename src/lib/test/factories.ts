import type { Card } from '$lib/types';

let seq = 0;

/**
 * テスト用の Card ファクトリ。必須フィールドを安全なデフォルトで埋め、
 * 必要な部分だけ上書きできる。cardID / image は未指定なら毎回ユニークになる。
 */
export function makeCard(partial: Partial<Card> = {}): Card {
  seq += 1;
  const id = partial.cardID ?? `TEST-${seq}`;
  return {
    cardID: id,
    productID: 'TEST',
    image: partial.image ?? `TEST/${id}.webp`,
    name: `カード${seq}`,
    subName: [],
    rarity: 'C',
    illust: '',
    cardType: ['シグニ'],
    lrigTypeClass: null,
    color: ['白'],
    level: null,
    cost: null,
    power: null,
    timing: null,
    lifeBurst: null,
    text: [],
    flavorText: '',
    faq: [],
    tags: [],
    ...partial,
  };
}
