import type { PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';

export const load: PageServerLoad = async (event) => {
  const { cardStats } = ctx(event);
  return { ranking: await cardStats.topCards(100) };
};
