import { describe, it, expect } from 'vitest';
import { computeUsageDelta } from './decks';
import type { DeckSlot } from '$lib/types';

const slot = (cardId: string, count: number, kind: DeckSlot['slot'] = 'main'): DeckSlot => ({
  slot: kind,
  cardId,
  count,
});
const find = (deltas: ReturnType<typeof computeUsageDelta>, cardId: string) =>
  deltas.find((d) => d.cardId === cardId);

describe('computeUsageDelta', () => {
  it('新規デッキは total=枚数 / deck=+1', () => {
    const deltas = computeUsageDelta([], [slot('A', 4)]);
    expect(find(deltas, 'A')).toEqual({ cardId: 'A', totalDelta: 4, deckDelta: 1 });
  });

  it('複数スロットの同一カードは合算して1エントリ', () => {
    const deltas = computeUsageDelta([], [slot('A', 4, 'main'), slot('A', 1, 'candidate')]);
    expect(deltas).toHaveLength(1);
    expect(find(deltas, 'A')).toEqual({ cardId: 'A', totalDelta: 5, deckDelta: 1 });
  });

  it('削除は total=-枚数 / deck=-1', () => {
    const deltas = computeUsageDelta([slot('A', 4)], []);
    expect(find(deltas, 'A')).toEqual({ cardId: 'A', totalDelta: -4, deckDelta: -1 });
  });

  it('枚数だけ変化（>0 のまま）は deckDelta=0', () => {
    const deltas = computeUsageDelta([slot('A', 4)], [slot('A', 2)]);
    expect(find(deltas, 'A')).toEqual({ cardId: 'A', totalDelta: -2, deckDelta: 0 });
  });

  it('変化なしのカードはエントリを作らない', () => {
    const deltas = computeUsageDelta([slot('A', 4)], [slot('A', 4), slot('B', 1)]);
    expect(find(deltas, 'A')).toBeUndefined();
    expect(find(deltas, 'B')).toEqual({ cardId: 'B', totalDelta: 1, deckDelta: 1 });
  });
});
