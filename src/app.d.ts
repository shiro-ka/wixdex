import type { KVNamespace, D1Database } from '@cloudflare/workers-types';

declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string | null;
        displayName: string;
        blueskyDid: string | null;
        blueskyHandle: string | null;
      };
      sessionId?: string;
    }
    interface Platform {
      env: {
        APP_URL: string;
        DB: D1Database;
        OAUTH_STATE: KVNamespace;
        OAUTH_SESSION: KVNamespace;
        WIXDEX_SESSION: KVNamespace;
        RATE_LIMIT: KVNamespace;
        OAUTH_PRIVATE_KEYS: string;
      };
      context: {
        waitUntil(promise: Promise<unknown>): void;
      };
    }
  }
}

export {};
