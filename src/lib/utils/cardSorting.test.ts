import { describe, it, expect } from 'vitest';
import type { Card } from '$lib/types';
import { sortMainDeck, sortLrigDeck } from './cardSorting';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    cardID: `id-${Math.random()}`,
    productID: null,
    image: '',
    name: '',
    subName: [],
    rarity: '',
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
    ...overrides,
  };
}

const names = (cards: Card[]) => cards.map((c) => c.cardID);

describe('sortMainDeck', () => {
  it('種別順 シグニ→スペル→サーバント', () => {
    const servant = makeCard({ cardID: 'srv', cardType: ['サーバント'] });
    const spell = makeCard({ cardID: 'spl', cardType: ['スペル'] });
    const signi = makeCard({ cardID: 'sig', cardType: ['シグニ'] });
    expect(names(sortMainDeck([servant, spell, signi]))).toEqual(['sig', 'spl', 'srv']);
  });

  it('シグニはレベル昇順', () => {
    const lv3 = makeCard({ cardID: 'c3', level: 3 });
    const lv1 = makeCard({ cardID: 'c1', level: 1 });
    expect(names(sortMainDeck([lv3, lv1]))).toEqual(['c1', 'c3']);
  });

  it('無色は色順で最後', () => {
    const colorless = makeCard({ cardID: 'mu', level: 1, color: ['無'] });
    const white = makeCard({ cardID: 'shiro', level: 1, color: ['白'] });
    expect(names(sortMainDeck([colorless, white]))).toEqual(['shiro', 'mu']);
  });
});

describe('読み込み順(orderMap)を最終キーに使う', () => {
  it('同種別・同レベル・同色なら orderMap の順で並ぶ(cardID辞書順より優先)', () => {
    const a = makeCard({ cardID: 'A', level: 1, color: ['白'] });
    const b = makeCard({ cardID: 'B', level: 1, color: ['白'] });
    const orderMap = new Map([['B', 0], ['A', 1]]);
    expect(names(sortMainDeck([a, b], orderMap))).toEqual(['B', 'A']);
  });

  it('orderMap 未指定なら cardID 辞書順にフォールバック', () => {
    const a = makeCard({ cardID: 'A', level: 1, color: ['白'] });
    const b = makeCard({ cardID: 'B', level: 1, color: ['白'] });
    expect(names(sortMainDeck([b, a]))).toEqual(['A', 'B']);
  });

  it('orderMap 未収録カードは末尾に回る', () => {
    const known = makeCard({ cardID: 'known', level: 1, color: ['白'] });
    const unknown = makeCard({ cardID: 'unknown', level: 1, color: ['白'] });
    const orderMap = new Map([['known', 0]]);
    expect(names(sortMainDeck([unknown, known], orderMap))).toEqual(['known', 'unknown']);
  });
});

describe('sortLrigDeck', () => {
  it('種別順 ルリグ→アシスト→ピース→アーツ', () => {
    const arts = makeCard({ cardID: 'arts', cardType: ['アーツ'] });
    const piece = makeCard({ cardID: 'piece', cardType: ['ピース'] });
    const assist = makeCard({ cardID: 'assist', cardType: ['アシスト'] });
    const lrig = makeCard({ cardID: 'lrig', cardType: ['ルリグ'] });
    expect(names(sortLrigDeck([arts, piece, assist, lrig]))).toEqual(['lrig', 'assist', 'piece', 'arts']);
  });
});
