import type { Card } from '$lib/types';

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

  get ids(): Set<string> {
    return this.#ids;
  }
}
