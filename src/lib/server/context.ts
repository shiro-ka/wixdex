import type { RequestEvent } from '@sveltejs/kit';
import { CloudflareStore } from './store.js';
import { Db } from './db.js';
import { DeckDb } from './decks.js';
import { CardStatsDb } from './cardStats.js';
import { FavoriteDb } from './favorites.js';

export interface ServerContext {
  env: App.Platform['env'];
  store: CloudflareStore;
  db: Db;
  decks: DeckDb;
  cardStats: CardStatsDb;
  favorites: FavoriteDb;
}

export function ctx(event: Pick<RequestEvent, 'platform'>): ServerContext {
  const env = event.platform!.env;
  return {
    env,
    store: new CloudflareStore(env),
    db: new Db(env.DB),
    decks: new DeckDb(env.DB),
    cardStats: new CardStatsDb(env.DB),
    favorites: new FavoriteDb(env.DB),
  };
}

export function getAppUrl(env: App.Platform['env']): string {
  return env.APP_URL ?? 'http://localhost:5173';
}
