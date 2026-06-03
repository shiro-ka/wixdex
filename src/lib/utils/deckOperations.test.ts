import { describe, it, expect } from 'vitest';
import { addCardToDeck, addMultipleCardsToDeck, removeCardFromDeck } from './deckOperations';
import { makeCard } from '$lib/test/factories';

const signi = (name: string, cardID?: string) =>
  makeCard({ cardType: ['シグニ'], name, ...(cardID ? { cardID } : {}) });
const center = (name: string) => makeCard({ cardType: ['ルリグ'], name });

describe('addCardToDeck', () => {
  it('シグニはメインデッキへ', () => {
    const res = addCardToDeck(signi('A'), [], []);
    expect(res.mainDeck).toHaveLength(1);
    expect(res.lrigDeck).toHaveLength(0);
  });

  it('ルリグはルリグデッキへ', () => {
    const res = addCardToDeck(center('L'), [], []);
    expect(res.lrigDeck).toHaveLength(1);
    expect(res.mainDeck).toHaveLength(0);
  });

  it('制限超過なら何も追加しない', () => {
    const deck = Array.from({ length: 4 }, () => signi('X'));
    const res = addCardToDeck(signi('X'), deck, []);
    expect(res.mainDeck).toHaveLength(4);
  });
});

describe('addMultipleCardsToDeck', () => {
  it('指定枚数を追加する', () => {
    const res = addMultipleCardsToDeck(signi('A'), 4, [], []);
    expect(res.mainDeck).toHaveLength(4);
  });

  it('同名制限に達したら打ち止めまで追加する', () => {
    const a = signi('A');
    const res = addMultipleCardsToDeck(a, 4, [a, a], []);
    expect(res.mainDeck).toHaveLength(4); // 既存2 + 2 = 4
  });
});

describe('removeCardFromDeck', () => {
  it('カード指定で同一カードIDを1枚抜く', () => {
    const a = signi('A', 'A');
    const b = signi('B', 'B');
    const res = removeCardFromDeck(a, [a, b], []);
    expect(res.mainDeck.map((c) => c.cardID)).toEqual(['B']);
  });

  it('インデックス指定で該当位置を抜く', () => {
    const deck = [signi('A', 'A'), signi('B', 'B'), signi('C', 'C')];
    const res = removeCardFromDeck(deck[1], deck, [], 1, 'main');
    expect(res.mainDeck.map((c) => c.cardID)).toEqual(['A', 'C']);
  });
});
