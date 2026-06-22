import type { Card } from '$lib/types';

export const CARD_SETS = [
  'header',
  'WX26-CP1',
  'WX25-P3',
  'WX25-P2',
  'WX25-P1',
  'WX25-CP1',
  'WX24-P4',
  'WX24-P3',
  'WX24-P2',
  'WX24-P1',
  'WXDi-P16',
  'WXDi-P15',
  'WXDi-CP02',
  'WXDi-P14',
  'WXDi-P13',
  'WXDi-P12',
  'WXDi-CP01',
  'WXDi-P11',
  'WXDi-P10',
  'WXDi-P09',
  'WXDi-P08',
  'WXDi-P07',
  'WXDi-P06',
  'WXDi-P05',
  'WXDi-P04',
  'WXDi-P03',
  'WXDi-P02',
  'WXDi-P01',
  'WXDi-P00',
];

export function cardKey(card: Pick<Card, 'cardID' | 'image'>): string | null {
  return card.cardID ?? card.image ?? null;
}

export async function loadAllCards(fetchImpl: typeof fetch = fetch): Promise<Card[]> {
  const results = await Promise.all(
    CARD_SETS.map((set) =>
      fetchImpl(`/assets/cards_json/${set}.json`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${set}.json`);
        return r.json() as Promise<Card[]>;
      }),
    ),
  );
  return results.flat();
}

export function buildCardMap(cards: Card[]): Map<string, Card> {
  const map = new Map<string, Card>();
  for (const card of cards) {
    const key = cardKey(card);
    if (key) map.set(key, card);
  }
  return map;
}

/**
 * カードキー -> 読み込み順インデックスの対応表。
 * loadAllCards() の並び(CARD_SETS 順 = 発売順)をソートの最終キーとして使うために構築する。
 */
export function buildOrderMap(cards: Card[]): Map<string, number> {
  const map = new Map<string, number>();
  cards.forEach((card, index) => {
    const key = cardKey(card);
    if (key !== null && !map.has(key)) map.set(key, index);
  });
  return map;
}
