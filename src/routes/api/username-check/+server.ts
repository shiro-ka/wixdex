import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';
import { validateUsername, normalizeUsername } from '$lib/utils/atName';

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
