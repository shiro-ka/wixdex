import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';
import { deckUpsertSchema } from './_schema';

export const GET: RequestHandler = async (event) => {
  if (!event.locals.user) error(401, 'Unauthorized');
  const { decks } = ctx(event);
  return json(await decks.listDecks(event.locals.user.id));
};

export const POST: RequestHandler = async (event) => {
  if (!event.locals.user) error(401, 'Unauthorized');
  const parsed = deckUpsertSchema.safeParse(await event.request.json().catch(() => null));
  if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Invalid request');

  const { decks } = ctx(event);
  return json(await decks.createDeck(event.locals.user.id, parsed.data), { status: 201 });
};
