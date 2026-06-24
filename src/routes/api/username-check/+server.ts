import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';
import { validateUsername, normalizeUsername } from '$lib/utils/atName';

/**
 * 登録フォームのユーザー名リアルタイム判定用。
 * 文字種・予約語・ブロック語を理由付きで弾き、通れば DB 重複も確認する。
 * 返り値: { available: true } / { available: false, error: '理由' }
 *
 * 注意: これは UX 向上のための事前チェックであり、最終的な権威ではない。
 * 実際の確保は register 時に行われる（チェック後〜送信前に他者が取る競合は残るため、
 * サーバ側 register でも getUserByUsername で再確認している）。
 */
export const GET: RequestHandler = async (event) => {
  const raw = event.url.searchParams.get('u') ?? '';

  const check = validateUsername(raw);
  if (!check.ok) {
    return json({ available: false, error: check.error });
  }

  const { db } = ctx(event);
  const existing = await db.getUserByUsername(normalizeUsername(raw));
  if (existing) {
    return json({ available: false, error: 'このユーザー名はすでに使われています。' });
  }

  return json({ available: true });
};
