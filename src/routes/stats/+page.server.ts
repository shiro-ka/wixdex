import type { PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';

export const load: PageServerLoad = async (event) => {
  event.setHeaders({ 'Cache-Control': 'public, max-age=60' });
  const { cardStats } = ctx(event);
  return { ranking: await cardStats.topCards(100) };
};
