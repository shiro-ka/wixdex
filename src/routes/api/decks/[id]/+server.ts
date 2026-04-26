import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';
import { deckUpsertSchema } from '../_schema';

export const GET: RequestHandler = async (event) => {
  if (!event.locals.user) error(401, 'Unauthorized');
  const { decks } = ctx(event);
  const deck = await decks.getDeck(event.params.id, event.locals.user.id);
  if (!deck) error(404, 'Not found');
  return json(deck);
};

export const PUT: RequestHandler = async (event) => {
  if (!event.locals.user) error(401, 'Unauthorized');
  const parsed = deckUpsertSchema.safeParse(await event.request.json().catch(() => null));
  if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Invalid request');

  const { decks } = ctx(event);
  const deck = await decks.updateDeck(event.params.id, event.locals.user.id, parsed.data);
  if (!deck) error(404, 'Not found');
  return json(deck);
};

export const DELETE: RequestHandler = async (event) => {
  if (!event.locals.user) error(401, 'Unauthorized');
  const { decks } = ctx(event);
  const ok = await decks.deleteDeck(event.params.id, event.locals.user.id);
  if (!ok) error(404, 'Not found');
  return new Response(null, { status: 204 });
};
