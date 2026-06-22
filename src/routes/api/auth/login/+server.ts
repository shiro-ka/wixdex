import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';
import { createOAuthClient } from '$lib/server/oauth';
import { checkRateLimit, incrementRateLimit } from '$lib/server/rate-limit';
import { z } from 'zod';

const schema = z.object({
  // 省略時は bsky.social のエントリーウェイへ直行（ハンドル入力不要のGoogle方式）。
  handle: z.string().max(255).optional(),
});

const DEFAULT_ENTRYWAY = 'https://bsky.social';

export const POST: RequestHandler = async (event) => {
  const { request, getClientAddress } = event;
  const { env, store } = ctx(event);
  const ip = getClientAddress();

  const { allowed } = await checkRateLimit(store, ip, 'oauth-start');
  if (!allowed) {
    return json({ error: 'Too many requests', message: 'リクエストが多すぎます。しばらく待ってください。' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Invalid request', message: '不正なリクエストです。' }, { status: 400 });
  }

  // ハンドル指定があればそれを、無ければ bsky.social のログインページへ直行。
  const target = parsed.data.handle?.trim() || DEFAULT_ENTRYWAY;

  try {
    await incrementRateLimit(store, ip, 'oauth-start');
    const client = await createOAuthClient(env, store);
    const url = await client.authorize(target, { scope: 'atproto transition:generic' });
    return json({ redirectUrl: url.toString() });
  } catch (err) {
    console.error('[/api/auth/login]', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('NXDOMAIN') || msg.includes('resolve') || msg.includes('not found')) {
      return json({ error: 'Handle not found', message: 'ハンドルが見つかりませんでした。正しいハンドルか確認してください。' }, { status: 404 });
    }
    return json({ error: 'Internal server error', message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
};
