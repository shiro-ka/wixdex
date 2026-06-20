import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';
import { createOAuthClient } from '$lib/server/oauth';
import { createSession } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
  const { url, cookies } = event;

  const error = url.searchParams.get('error');
  if (error) {
    const params = new URLSearchParams({
      error: 'oauth_error',
      message: url.searchParams.get('error_description') ?? error,
    });
    redirect(302, `/login?${params}`);
  }

  const { env, store, db } = ctx(event);
  let did: string;
  try {
    const client = await createOAuthClient(env, store);
    const { session } = await client.callback(url.searchParams);
    did = session.did;
  } catch (err) {
    console.error('[/api/auth/callback] oauth callback failed:', err);
    const params = new URLSearchParams({ error: 'oauth_failed', message: 'Bluesky認証に失敗しました。もう一度お試しください。' });
    redirect(302, `/login?${params}`);
  }

  let handle = did;
  try {
    const res = await fetch(
      `https://bsky.social/xrpc/com.atproto.repo.describeRepo?repo=${encodeURIComponent(did)}`
    );
    if (res.ok) {
      const data = (await res.json()) as { handle?: string };
      handle = data.handle ?? did;
    }
  } catch {
    // fall back to DID
  }

  const user = await db.upsertBlueskyUser(did, handle, handle);
  await createSession(cookies, env, store, {
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
    username: user.username,
    blueskyDid: did,
    blueskyHandle: handle,
  });

  redirect(302, '/');
};
