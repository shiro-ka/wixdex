import { useState, useEffect } from 'react';
import type { Card } from '../types/card';

const CARD_SETS = [
  'servant',
  'WX25-P1',
  'WX24-P2',
  'WX24-P3',
  'WX24-P4',
  'WXDi-P16',
  'WXDi-P15',
  'WXDi-P13',
  'WXDi-P12',
];

export function useCardData() {
  const [cardData, setCardData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAllCardSets = async () => {
      try {
        const basePath = import.meta.env.BASE_URL || '/';
        const responses = await Promise.all(
          CARD_SETS.map(set =>
            fetch(`${basePath}assets/cards_json/${set}.json`).then(r => {
              if (!r.ok) throw new Error(`Failed to load ${set}.json`);
              return r.json();
            })
          )
        );

        const allCards = responses.flat() as Card[];
        setCardData(allCards);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('カードデータの読み込みに失敗しました'));
      } finally {
        setLoading(false);
      }
    };

    loadAllCardSets();
  }, []);

  return { cardData, loading, error };
}
