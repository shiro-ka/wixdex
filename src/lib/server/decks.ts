import { newDeckId } from './ids.js';
import type {
  DeckSummary,
  DeckDetail,
  DeckSlot,
  DeckUpsert,
  DeckSlotKind,
  PublicDeckDetail,
} from '$lib/types';

interface DeckRow {
  id: string;
  user_id: string;
  name: string;
  memo: string;
  is_public: number;
  created_at: number;
  updated_at: number;
}

interface UsageDelta {
  cardId: string;
  totalDelta: number;
  deckDelta: number;
}

function aggregateSlots(slots: DeckSlot[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const s of slots) totals.set(s.cardId, (totals.get(s.cardId) ?? 0) + s.count);
  return totals;
}

export function computeUsageDelta(oldSlots: DeckSlot[], newSlots: DeckSlot[]): UsageDelta[] {
  const oldTotals = aggregateSlots(oldSlots);
  const newTotals = aggregateSlots(newSlots);
  const cardIds = new Set<string>([...oldTotals.keys(), ...newTotals.keys()]);
  const deltas: UsageDelta[] = [];
  for (const cardId of cardIds) {
    const oldTotal = oldTotals.get(cardId) ?? 0;
    const newTotal = newTotals.get(cardId) ?? 0;
    const totalDelta = newTotal - oldTotal;
    const deckDelta = (newTotal > 0 ? 1 : 0) - (oldTotal > 0 ? 1 : 0);
    if (totalDelta === 0 && deckDelta === 0) continue;
    deltas.push({ cardId, totalDelta, deckDelta });
  }
  return deltas;
}

export class DeckDb {
  constructor(private d1: App.Platform['env']['DB']) {}

  async listDecks(userId: string): Promise<DeckSummary[]> {
    const rows = await this.d1
      .prepare('SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC')
      .bind(userId)
      .all<DeckRow>();

    if (!rows.results.length) return [];

    const deckIds = rows.results.map((r) => r.id);
    const placeholders = deckIds.map(() => '?').join(',');
    const cardRows = await this.d1
      .prepare(
        `SELECT deck_id, slot, SUM(count) as total FROM deck_cards WHERE deck_id IN (${placeholders}) GROUP BY deck_id, slot`
      )
      .bind(...deckIds)
      .all<{ deck_id: string; slot: string; total: number }>();

    const countMap = new Map<string, { main: number; lrig: number; candidate: number }>();
    for (const row of cardRows.results) {
      if (!countMap.has(row.deck_id))
        countMap.set(row.deck_id, { main: 0, lrig: 0, candidate: 0 });
      const counts = countMap.get(row.deck_id)!;
      if (row.slot === 'main') counts.main = row.total;
      else if (row.slot === 'lrig') counts.lrig = row.total;
      else if (row.slot === 'candidate') counts.candidate = row.total;
    }

    return rows.results.map((row) => ({
      id: row.id,
      name: row.name,
      memo: row.memo,
      isPublic: row.is_public === 1,
      mainCount: countMap.get(row.id)?.main ?? 0,
      lrigCount: countMap.get(row.id)?.lrig ?? 0,
      candidateCount: countMap.get(row.id)?.candidate ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getDeck(id: string, userId: string): Promise<DeckDetail | null> {
    const row = await this.d1
      .prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first<DeckRow>();

    if (!row) return null;

    const cardRows = await this.d1
      .prepare('SELECT slot, card_id, count FROM deck_cards WHERE deck_id = ?')
      .bind(id)
      .all<{ slot: string; card_id: string; count: number }>();

    return {
      id: row.id,
      name: row.name,
      memo: row.memo,
      isPublic: row.is_public === 1,
      slots: cardRows.results.map((r) => ({
        slot: r.slot as DeckSlotKind,
        cardId: r.card_id,
        count: r.count,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /** 公開デッキ（is_public=1）を所有者チェック無しで取得。作者情報も同時取得。 */
  async getPublicDeck(id: string): Promise<PublicDeckDetail | null> {
    const row = await this.d1
      .prepare(
        `SELECT d.id, d.name, d.memo, d.created_at, d.updated_at,
                u.display_name AS author_name, u.bluesky_handle AS author_handle
         FROM decks d JOIN users u ON u.id = d.user_id
         WHERE d.id = ? AND d.is_public = 1`
      )
      .bind(id)
      .first<{
        id: string;
        name: string;
        memo: string;
        created_at: number;
        updated_at: number;
        author_name: string;
        author_handle: string | null;
      }>();

    if (!row) return null;

    const cardRows = await this.d1
      .prepare('SELECT slot, card_id, count FROM deck_cards WHERE deck_id = ?')
      .bind(id)
      .all<{ slot: string; card_id: string; count: number }>();

    return {
      id: row.id,
      name: row.name,
      memo: row.memo,
      slots: cardRows.results.map((r) => ({
        slot: r.slot as DeckSlotKind,
        cardId: r.card_id,
        count: r.count,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: { displayName: row.author_name, blueskyHandle: row.author_handle },
    };
  }

  /** 公開デッキを (所有者id, slug) で取得。/@user/[slug] ルート用。作者情報も同梱。 */
  async getPublicDeckBySlug(userId: string, slug: string): Promise<PublicDeckDetail | null> {
    const row = await this.d1
      .prepare(
        `SELECT d.id, d.name, d.memo, d.created_at, d.updated_at,
                u.display_name AS author_name, u.bluesky_handle AS author_handle
         FROM decks d JOIN users u ON u.id = d.user_id
         WHERE d.user_id = ? AND d.slug = ? AND d.is_public = 1`
      )
      .bind(userId, slug)
      .first<{
        id: string;
        name: string;
        memo: string;
        created_at: number;
        updated_at: number;
        author_name: string;
        author_handle: string | null;
      }>();

    if (!row) return null;

    const cardRows = await this.d1
      .prepare('SELECT slot, card_id, count FROM deck_cards WHERE deck_id = ?')
      .bind(row.id)
      .all<{ slot: string; card_id: string; count: number }>();

    return {
      id: row.id,
      name: row.name,
      memo: row.memo,
      slots: cardRows.results.map((r) => ({
        slot: r.slot as DeckSlotKind,
        cardId: r.card_id,
        count: r.count,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: { displayName: row.author_name, blueskyHandle: row.author_handle },
    };
  }

  private usageStatements(deltas: UsageDelta[], now: number) {
    return deltas.map((d) =>
      this.d1
        .prepare(
          `INSERT INTO card_usage_aggregate (card_id, deck_count, total_count, last_updated)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(card_id) DO UPDATE SET
             deck_count = card_usage_aggregate.deck_count + excluded.deck_count,
             total_count = card_usage_aggregate.total_count + excluded.total_count,
             last_updated = excluded.last_updated`
        )
        .bind(d.cardId, d.deckDelta, d.totalDelta, now)
    );
  }

  private async fetchSlots(deckId: string): Promise<DeckSlot[]> {
    const rows = await this.d1
      .prepare('SELECT slot, card_id, count FROM deck_cards WHERE deck_id = ?')
      .bind(deckId)
      .all<{ slot: string; card_id: string; count: number }>();
    return rows.results.map((r) => ({
      slot: r.slot as DeckSlotKind,
      cardId: r.card_id,
      count: r.count,
    }));
  }

  async createDeck(userId: string, data: DeckUpsert): Promise<DeckDetail> {
    const id = newDeckId();
    const now = Math.floor(Date.now() / 1000);
    const deltas = computeUsageDelta([], data.slots);

    await this.d1.batch([
      this.d1
        .prepare(
          'INSERT INTO decks (id, user_id, name, memo, slug, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        // slug は初期値として内部idを流用。後からユーザーが変更可能(Phase 3)。
        .bind(id, userId, data.name, data.memo, id, data.isPublic ? 1 : 0, now, now),
      ...data.slots.map((s) =>
        this.d1
          .prepare(
            'INSERT INTO deck_cards (deck_id, slot, card_id, count) VALUES (?, ?, ?, ?)'
          )
          .bind(id, s.slot, s.cardId, s.count)
      ),
      ...this.usageStatements(deltas, now),
    ]);

    return {
      id,
      name: data.name,
      memo: data.memo,
      isPublic: data.isPublic ?? false,
      slots: data.slots,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateDeck(id: string, userId: string, data: DeckUpsert): Promise<DeckDetail | null> {
    const existing = await this.d1
      .prepare('SELECT id, created_at FROM decks WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first<{ id: string; created_at: number }>();

    if (!existing) return null;

    const oldSlots = await this.fetchSlots(id);
    const now = Math.floor(Date.now() / 1000);
    const deltas = computeUsageDelta(oldSlots, data.slots);

    await this.d1.batch([
      this.d1
        .prepare(
          'UPDATE decks SET name = ?, memo = ?, is_public = ?, updated_at = ? WHERE id = ?'
        )
        .bind(data.name, data.memo, data.isPublic ? 1 : 0, now, id),
      this.d1.prepare('DELETE FROM deck_cards WHERE deck_id = ?').bind(id),
      ...data.slots.map((s) =>
        this.d1
          .prepare(
            'INSERT INTO deck_cards (deck_id, slot, card_id, count) VALUES (?, ?, ?, ?)'
          )
          .bind(id, s.slot, s.cardId, s.count)
      ),
      ...this.usageStatements(deltas, now),
    ]);

    return {
      id,
      name: data.name,
      memo: data.memo,
      isPublic: data.isPublic ?? false,
      slots: data.slots,
      createdAt: existing.created_at,
      updatedAt: now,
    };
  }

  async deleteDeck(id: string, userId: string): Promise<boolean> {
    const existing = await this.d1
      .prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first<{ id: string }>();
    if (!existing) return false;

    const oldSlots = await this.fetchSlots(id);
    const now = Math.floor(Date.now() / 1000);
    const deltas = computeUsageDelta(oldSlots, []);

    const results = await this.d1.batch([
      this.d1.prepare('DELETE FROM decks WHERE id = ? AND user_id = ?').bind(id, userId),
      ...this.usageStatements(deltas, now),
    ]);

    return results[0]?.success === true && (results[0]?.meta.changes ?? 0) > 0;
  }
}
