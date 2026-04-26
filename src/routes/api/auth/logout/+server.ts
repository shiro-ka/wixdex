import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';
import { destroySession } from '$lib/server/auth';
import { revokeOAuthSession } from '$lib/server/oauth';

export const POST: RequestHandler = async (event) => {
  const { cookies, locals } = event;
  const { env, store } = ctx(event);

  if (locals.user?.blueskyDid) {
    await revokeOAuthSession(env, store, locals.user.blueskyDid);
  }
  await destroySession(cookies, store);
  return new Response(null, { status: 204 });
};
