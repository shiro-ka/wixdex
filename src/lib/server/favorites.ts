export class FavoriteDb {
  constructor(private d1: App.Platform['env']['DB']) {}

  async listFavoriteIds(userId: string): Promise<string[]> {
    const rows = await this.d1
      .prepare('SELECT card_id FROM favorites WHERE user_id = ?')
      .bind(userId)
      .all<{ card_id: string }>();
    return rows.results.map((r) => r.card_id);
  }

  async addFavorite(userId: string, cardId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.d1
      .prepare('INSERT OR IGNORE INTO favorites (user_id, card_id, created_at) VALUES (?, ?, ?)')
      .bind(userId, cardId, now)
      .run();
  }

  async removeFavorite(userId: string, cardId: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM favorites WHERE user_id = ? AND card_id = ?')
      .bind(userId, cardId)
      .run();
  }
}
