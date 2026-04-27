import type { PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) return { favoriteIds: [] };
  const { favorites } = ctx(event);
  return { favoriteIds: await favorites.listFavoriteIds(event.locals.user.id) };
};
