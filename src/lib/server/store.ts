export interface AppSession {
  userId: string;
  email: string | null;
  displayName: string;
  blueskyDid: string | null;
  blueskyHandle: string | null;
}

interface SessionMeta {
  expiresAt: number;
}

type Json = Record<string, unknown>;

export class CloudflareStore {
  constructor(private env: App.Platform['env']) {}

  // ── OAuth state (KV, 10-min TTL) ─────────────────────────────────────────

  async getOAuthState(key: string): Promise<Json | undefined> {
    return (await this.env.OAUTH_STATE.get<Json>(key, 'json')) ?? undefined;
  }

  async setOAuthState(key: string, value: Json): Promise<void> {
    await this.env.OAUTH_STATE.put(key, JSON.stringify(value), { expirationTtl: 600 });
  }

  async delOAuthState(key: string): Promise<void> {
    await this.env.OAUTH_STATE.delete(key);
  }

  // ── OAuth session (KV, no TTL — SDK manages lifetime) ────────────────────

  async getOAuthSession(did: string): Promise<Json | undefined> {
    return (await this.env.OAUTH_SESSION.get<Json>(did, 'json')) ?? undefined;
  }

  async setOAuthSession(did: string, value: Json): Promise<void> {
    await this.env.OAUTH_SESSION.put(did, JSON.stringify(value));
  }

  async delOAuthSession(did: string): Promise<void> {
    await this.env.OAUTH_SESSION.delete(did);
  }

  // ── App session (KV with TTL + metadata for remaining-TTL queries) ────────

  async getSession(sessionId: string): Promise<AppSession | undefined> {
    return (await this.env.WIXDEX_SESSION.get<AppSession>(sessionId, 'json')) ?? undefined;
  }

  async setSession(sessionId: string, value: AppSession, ttlSeconds: number): Promise<void> {
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    await this.env.WIXDEX_SESSION.put(sessionId, JSON.stringify(value), {
      expirationTtl: ttlSeconds,
      metadata: { expiresAt } satisfies SessionMeta,
    });
  }

  async delSession(sessionId: string): Promise<void> {
    await this.env.WIXDEX_SESSION.delete(sessionId);
  }

  async sessionTtl(sessionId: string): Promise<number> {
    const { metadata } = await this.env.WIXDEX_SESSION.getWithMetadata<AppSession, SessionMeta>(
      sessionId,
      'json'
    );
    if (!metadata) return 0;
    return Math.max(0, metadata.expiresAt - Math.floor(Date.now() / 1000));
  }

  // ── Rate limiting (KV, non-atomic — eventual consistency acceptable) ──────

  async incrRate(key: string, ttlSeconds: number): Promise<number> {
    const existing = await this.env.RATE_LIMIT.get<{ count: number }>(key, 'json');
    const count = (existing?.count ?? 0) + 1;
    await this.env.RATE_LIMIT.put(key, JSON.stringify({ count }), { expirationTtl: ttlSeconds });
    return count;
  }

  async getRateCount(key: string): Promise<number> {
    const val = await this.env.RATE_LIMIT.get<{ count: number }>(key, 'json');
    return val?.count ?? 0;
  }
}
