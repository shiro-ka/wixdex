import { installRedirectShim } from '$lib/server/redirect-shim';

// Must run before any @atproto/oauth-client-node code is loaded.
installRedirectShim();

import type { Handle } from '@sveltejs/kit';
import { CloudflareStore } from '$lib/server/store';
import { getSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const platform = event.platform;
  if (platform?.env?.WIXDEX_SESSION) {
    const store = new CloudflareStore(platform.env);
    const session = await getSession(event.cookies, store);
    if (session) {
      event.locals.user = {
        id: session.userId,
        email: session.email,
        displayName: session.displayName,
        blueskyDid: session.blueskyDid,
        blueskyHandle: session.blueskyHandle,
      };
    }
  }

  // dev限定の偽ログイン切替（ローカルでログイン済/未ログインを両方テストする用）。
  // import.meta.env.DEV は本番ビルドで false 固定 → このブロックごと消えるので本番には載らない。
  // 使い方: /?_devlogin=1 でログイン状態に、 /?_devlogin=0 で解除（クッキー保持で以後継続）。
  if (import.meta.env.DEV) {
    const toggle = event.url.searchParams.get('_devlogin');
    if (toggle === '1') event.cookies.set('dev_login', '1', { path: '/' });
    if (toggle === '0') event.cookies.delete('dev_login', { path: '/' });
    if (!event.locals.user && event.cookies.get('dev_login') === '1') {
      event.locals.user = {
        id: 'dev-user',
        email: 'dev@example.com',
        displayName: 'Dev User',
        blueskyDid: 'did:plc:devuser',
        blueskyHandle: 'dev.local',
      };
    }
  }

  return resolve(event);
};
