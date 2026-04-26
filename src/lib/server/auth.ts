import type { Cookies } from '@sveltejs/kit';
import type { CloudflareStore, AppSession } from './store.js';
import { newSessionId } from './ids.js';
import { getAppUrl } from './context.js';

const SESSION_COOKIE = 'wixdex_session';
const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days

export async function getSession(
  cookies: Cookies,
  store: CloudflareStore
): Promise<AppSession | undefined> {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (!sessionId) return undefined;
  return store.getSession(sessionId);
}

export async function createSession(
  cookies: Cookies,
  env: App.Platform['env'],
  store: CloudflareStore,
  session: AppSession
): Promise<string> {
  const sessionId = newSessionId();
  await store.setSession(sessionId, session, SESSION_TTL);

  const isSecure = getAppUrl(env).startsWith('https://');
  cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: SESSION_TTL,
    path: '/',
  });
  return sessionId;
}

export async function destroySession(cookies: Cookies, store: CloudflareStore): Promise<void> {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (sessionId) {
    await store.delSession(sessionId);
    cookies.delete(SESSION_COOKIE, { path: '/' });
  }
}

export async function refreshSession(
  cookies: Cookies,
  store: CloudflareStore,
  updates: Partial<AppSession>
): Promise<void> {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (!sessionId) return;
  const session = await store.getSession(sessionId);
  if (!session) return;
  const ttl = await store.sessionTtl(sessionId);
  await store.setSession(sessionId, { ...session, ...updates }, ttl > 0 ? ttl : SESSION_TTL);
}
