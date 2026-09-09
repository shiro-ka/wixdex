import type { Card } from '$lib/types';

/**
 * お気に入りカード。表示は即時に切り替え、サーバーへは後から投げる
 * （一覧のハートを連打しても待たされない）。
 */
export class FavoritesStore {
  #ids = $state<Set<string>>(new Set());

  constructor(initial: string[] = []) {
    this.#ids = new Set(initial);
  }

  has = (card: Card): boolean => !!card.cardID && this.#ids.has(card.cardID);

  async toggle(card: Card): Promise<void> {
    const cardID = card.cardID;
    if (!cardID) return;
    const exists = this.#ids.has(cardID);
    this.#ids = exists
      ? new Set([...this.#ids].filter((id) => id !== cardID))
      : new Set([...this.#ids, cardID]);
    await fetch('/api/favorites', {
      method: exists ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: cardID }),
    });
  }

  /** フィルタ側が集合そのものを要る。 */
  get ids(): Set<string> {
    return this.#ids;
  }
}
