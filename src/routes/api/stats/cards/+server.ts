import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export const GET: RequestHandler = async (event) => {
  const url = event.url;
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get('limit')) || DEFAULT_LIMIT));
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);

  const { cardStats } = ctx(event);
  return json(await cardStats.topCards(limit, offset), {
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
};
