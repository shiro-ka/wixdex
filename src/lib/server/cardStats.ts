import type { CardUsage } from '$lib/types';

interface UsageRow {
  card_id: string;
  deck_count: number;
  total_count: number;
  last_updated: number;
}

export class CardStatsDb {
  constructor(private d1: App.Platform['env']['DB']) {}

  async topCards(limit: number, offset: number = 0): Promise<CardUsage[]> {
    const rows = await this.d1
      .prepare(
        `SELECT card_id, deck_count, total_count, last_updated
         FROM card_usage_aggregate
         WHERE deck_count > 0
         ORDER BY deck_count DESC, total_count DESC, card_id ASC
         LIMIT ? OFFSET ?`
      )
      .bind(limit, offset)
      .all<UsageRow>();

    return rows.results.map((r) => ({
      cardId: r.card_id,
      deckCount: r.deck_count,
      totalCount: r.total_count,
      lastUpdated: r.last_updated,
    }));
  }
}
