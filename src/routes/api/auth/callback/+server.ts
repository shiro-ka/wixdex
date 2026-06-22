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

  // 認証で確定するのは DID のみ。handle / 表示名は AppView から「検証済み」の値だけ採用する。
  // AppView は handle を双方向検証(DID⇄handle)してから配信し、未検証なら 'handle.invalid' を返す。
  // PDS の自己申告(describeRepo)を信用しないことで、@handle のなりすまし表示を防ぐ。
  let handle = did;
  let displayName = '';
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = (await res.json()) as { handle?: string; displayName?: string };
      if (data.handle && data.handle !== 'handle.invalid') handle = data.handle;
      if (data.displayName) displayName = data.displayName;
    }
  } catch {
    // 取得失敗時は DID 表示にフォールバック
  }

  const user = await db.upsertBlueskyUser(did, handle, displayName || handle);
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
