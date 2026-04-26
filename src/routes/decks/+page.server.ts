import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) redirect(302, '/login');
  const { decks } = ctx(event);
  return { decks: await decks.listDecks(event.locals.user.id) };
};
