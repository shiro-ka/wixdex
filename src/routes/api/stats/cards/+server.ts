import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export const GET: RequestHandler = async (event) => {
  const url = event.url;
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get('limit')) || DEFAULT_LIMIT));
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);
  if (!Number.isFinite(limit) || !Number.isFinite(offset)) error(400, 'Invalid limit/offset');

  const { cardStats } = ctx(event);
  return json(await cardStats.topCards(limit, offset), {
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
};
