import { OAuthClient, AtprotoDohHandleResolver } from '@atproto/oauth-client-node';
import { JoseKey } from '@atproto/jwk-jose';
import type { CloudflareStore } from './store.js';
import { getAppUrl } from './context.js';

// Workers don't support redirect:"error" — transparently rewrite to "manual"
const workerFetch: typeof fetch = (input, init) =>
  init?.redirect === 'error'
    ? fetch(input, { ...init, redirect: 'manual' })
    : fetch(input, init);

type Json = Record<string, unknown>;

// Serialize dpopKey as JWK on write, reconstruct JoseKey on read.
// Without this, JSON round-trip through KV drops the class getter `algorithms`
// and .includes() crashes in the callback.
function wrapDpopStore<T>(store: {
  get: (k: string) => Promise<Json | undefined>;
  set: (k: string, v: Json) => Promise<void>;
  del: (k: string) => Promise<void>;
}) {
  return {
    async get(key: string): Promise<T | undefined> {
      const raw = (await store.get(key)) as (Json & { dpopJwk?: Json }) | undefined;
      if (!raw) return undefined;
      const { dpopJwk, ...rest } = raw;
      if (!dpopJwk) return raw as T;
      const dpopKey = await JoseKey.fromJWK(dpopJwk);
      return { ...rest, dpopKey } as T;
    },
    async set(
      key: string,
      value: T & { dpopKey?: { privateJwk?: Json } }
    ): Promise<void> {
      const { dpopKey, ...rest } = value as Json & {
        dpopKey?: { privateJwk?: Json };
      };
      if (dpopKey) {
        const dpopJwk = dpopKey.privateJwk;
        if (!dpopJwk) throw new Error('Private DPoP JWK is missing.');
        await store.set(key, { ...rest, dpopJwk });
      } else {
        await store.set(key, value as Json);
      }
    },
    async del(key: string): Promise<void> {
      await store.del(key);
    },
  };
}

export async function createOAuthClient(
  env: App.Platform['env'],
  store: CloudflareStore
): Promise<OAuthClient> {
  const appUrl = getAppUrl(env);
  const rawKeys = env.OAUTH_PRIVATE_KEYS ?? '[]';
  const keyset = await Promise.all(
    (JSON.parse(rawKeys) as Record<string, unknown>[]).map((k) => JoseKey.fromJWK(k))
  );

  return new OAuthClient({
    fetch: workerFetch,
    handleResolver: new AtprotoDohHandleResolver({
      dohEndpoint: 'https://cloudflare-dns.com/dns-query',
      fetch: workerFetch,
    }),
    responseMode: 'query',
    runtimeImplementation: {
      createKey: (algs) => JoseKey.generate(algs),
      getRandomValues: (n: number) => crypto.getRandomValues(new Uint8Array(n)) as Uint8Array,
      digest: async (bytes, algorithm) => {
        const name = algorithm.name.toUpperCase().replace(/^SHA/, 'SHA-');
        return new Uint8Array(await crypto.subtle.digest(name, bytes as unknown as ArrayBuffer));
      },
    },
    clientMetadata: {
      client_id: `${appUrl}/api/oauth/client-metadata.json`,
      client_name: 'wixdex',
      client_uri: appUrl,
      redirect_uris: [`${appUrl}/api/auth/callback`],
      scope: 'atproto transition:generic',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'private_key_jwt',
      token_endpoint_auth_signing_alg: 'ES256',
      application_type: 'web',
      dpop_bound_access_tokens: true,
      jwks_uri: `${appUrl}/api/oauth/jwks.json`,
    } as never,
    allowHttp: appUrl.startsWith('http://'),
    keyset,
    stateStore: wrapDpopStore({
      get: (k) => store.getOAuthState(k),
      set: (k, v) => store.setOAuthState(k, v),
      del: (k) => store.delOAuthState(k),
    }),
    sessionStore: wrapDpopStore({
      get: (k) => store.getOAuthSession(k),
      set: (k, v) => store.setOAuthSession(k, v),
      del: (k) => store.delOAuthSession(k),
    }),
  });
}

export async function revokeOAuthSession(
  env: App.Platform['env'],
  store: CloudflareStore,
  did: string
): Promise<void> {
  try {
    const client = await createOAuthClient(env, store);
    await client.revoke(did);
  } catch (err) {
    console.warn('[oauth] revoke failed:', err);
  }
}
