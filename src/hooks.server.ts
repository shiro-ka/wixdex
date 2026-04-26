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
  return resolve(event);
};
