import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';

export const load: PageServerLoad = async (event) => {
  const { decks } = ctx(event);
  const deck = await decks.getPublicDeck(event.params.id);
  if (!deck) error(404, 'このデッキは存在しないか、非公開です。');
  return { deck };
};
