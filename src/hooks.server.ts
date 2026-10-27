import { installRedirectShim } from '$lib/server/redirect-shim';

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
        username: session.username ?? null,
        blueskyDid: session.blueskyDid,
        blueskyHandle: session.blueskyHandle,
      };
    }
  }

  if (import.meta.env.DEV) {
    const toggle = event.url.searchParams.get('_devlogin');
    if (toggle === '1') event.cookies.set('dev_login', '1', { path: '/' });
    if (toggle === '0') event.cookies.delete('dev_login', { path: '/' });
    if (!event.locals.user && event.cookies.get('dev_login') === '1') {
      event.locals.user = {
        id: 'dev-user',
        email: 'dev@example.com',
        displayName: 'Dev User',
        username: 'devuser',
        blueskyDid: 'did:plc:devuser',
        blueskyHandle: 'dev.local',
      };
    }
  }

  return resolve(event);
};
