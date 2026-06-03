import { describe, it, expect } from 'vitest';
import { sortMainDeck, sortLrigDeck, sortCandidateCards } from './cardSorting';
import { makeCard } from '$lib/test/factories';

const types = (cards: ReturnType<typeof makeCard>[]) => cards.map((c) => c.cardType[0]);

describe('sortMainDeck', () => {
  it('カードタイプ順（シグニ→スペル→サーバント）に並べる', () => {
    const input = [
      makeCard({ cardType: ['サーバント'] }),
      makeCard({ cardType: ['スペル'] }),
      makeCard({ cardType: ['シグニ'] }),
    ];
    expect(types(sortMainDeck(input))).toEqual(['シグニ', 'スペル', 'サーバント']);
  });

  it('シグニ同士はレベル昇順', () => {
    const input = [
      makeCard({ cardType: ['シグニ'], level: 3, cardID: 'B' }),
      makeCard({ cardType: ['シグニ'], level: 1, cardID: 'A' }),
    ];
    expect(sortMainDeck(input).map((c) => c.level)).toEqual([1, 3]);
  });

  it('元配列を破壊しない', () => {
    const input = [makeCard({ cardType: ['スペル'] }), makeCard({ cardType: ['シグニ'] })];
    const snapshot = types(input);
    sortMainDeck(input);
    expect(types(input)).toEqual(snapshot);
  });
});

describe('sortLrigDeck', () => {
  it('ルリグ→アシスト→ピース→アーツ順に並べる', () => {
    const input = [
      makeCard({ cardType: ['アーツ'] }),
      makeCard({ cardType: ['ピース'] }),
      makeCard({ cardType: ['アシスト'] }),
      makeCard({ cardType: ['ルリグ'] }),
    ];
    expect(types(sortLrigDeck(input))).toEqual(['ルリグ', 'アシスト', 'ピース', 'アーツ']);
  });
});

describe('sortCandidateCards', () => {
  it('ルリグ系→メイン系の順に並べる', () => {
    const input = [
      makeCard({ cardType: ['シグニ'] }),
      makeCard({ cardType: ['ルリグ'] }),
      makeCard({ cardType: ['サーバント'] }),
      makeCard({ cardType: ['アーツ'] }),
    ];
    expect(types(sortCandidateCards(input))).toEqual(['ルリグ', 'アーツ', 'シグニ', 'サーバント']);
  });
});
