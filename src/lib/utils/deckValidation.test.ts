import { describe, it, expect } from 'vitest';
import { canAddCard, canAddToMainDeck, canAddToLrigDeck } from './deckValidation';
import { makeCard } from '$lib/test/factories';

const signi = (name: string) => makeCard({ cardType: ['シグニ'], name });
const center = (name: string) => makeCard({ cardType: ['ルリグ'], name });
const assist = (name: string) => makeCard({ cardType: ['アシスト'], name });
const piece = (name: string) => makeCard({ cardType: ['ピース'], name });
const arts = (name: string) => makeCard({ cardType: ['アーツ'], name });

// 同名 N 枚（名前は同じ、cardID は別）
const repeat = (factory: (n: string) => ReturnType<typeof makeCard>, name: string, count: number) =>
  Array.from({ length: count }, () => factory(name));

describe('canAddToMainDeck', () => {
  it('空デッキにシグニを追加できる', () => {
    expect(canAddToMainDeck(signi('A'), []).valid).toBe(true);
  });

  it('ルリグ系はメインに入らない', () => {
    expect(canAddToMainDeck(center('L'), []).valid).toBe(false);
  });

  it('40枚で打ち止め', () => {
    // 10種 × 4枚 = 40（同名4枚制限には掛からない構成）
    const deck = Array.from({ length: 40 }, (_, i) => signi(`n${i % 10}`));
    const res = canAddToMainDeck(signi('new'), deck);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('40枚');
  });

  it('同名4枚制限', () => {
    const res = canAddToMainDeck(signi('X'), repeat(signi, 'X', 4));
    expect(res.valid).toBe(false);
    expect(res.error).toContain('同名');
  });
});

describe('canAddToLrigDeck', () => {
  it('メイン系はルリグに入らない', () => {
    expect(canAddToLrigDeck(signi('A'), []).valid).toBe(false);
  });

  it('センタールリグは1枚まで（名前違いでも）', () => {
    const res = canAddToLrigDeck(center('L2'), [center('L1')]);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('センタールリグ');
  });

  it('ルリグデッキの同名は1枚まで', () => {
    const res = canAddToLrigDeck(center('L'), [center('L')]);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('同名');
  });

  it('アシストは4枚まで', () => {
    const deck = [assist('a1'), assist('a2'), assist('a3'), assist('a4')];
    const res = canAddToLrigDeck(assist('a5'), deck);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('アシスト');
  });

  it('ピースは2枚まで', () => {
    const res = canAddToLrigDeck(piece('p3'), [piece('p1'), piece('p2')]);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('ピース');
  });

  it('アーツは6枚まで', () => {
    const deck = Array.from({ length: 6 }, (_, i) => arts(`x${i}`));
    const res = canAddToLrigDeck(arts('x6'), deck);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('アーツ');
  });

  it('ルリグデッキ全体で8枚まで', () => {
    const deck = [
      center('L'),
      assist('a1'),
      assist('a2'),
      assist('a3'),
      assist('a4'),
      piece('p1'),
      piece('p2'),
      arts('x1'),
    ];
    expect(deck).toHaveLength(8);
    const res = canAddToLrigDeck(arts('x2'), deck);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('8枚');
  });
});

describe('canAddCard', () => {
  it('タイプに応じて振り分ける', () => {
    expect(canAddCard(signi('A'), [], []).valid).toBe(true);
    expect(canAddCard(center('L'), [], []).valid).toBe(true);
  });

  it('未知のタイプは弾く', () => {
    const res = canAddCard(makeCard({ cardType: ['謎'] }), [], []);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('不明');
  });
});
