import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';

export const GET: RequestHandler = async (event) => {
  if (!event.locals.user) error(401, 'Unauthorized');
  const { favorites } = ctx(event);
  return json(await favorites.listFavoriteIds(event.locals.user.id));
};

export const POST: RequestHandler = async (event) => {
  if (!event.locals.user) error(401, 'Unauthorized');
  const body = await event.request.json().catch(() => null);
  if (!body?.cardId || typeof body.cardId !== 'string' || body.cardId.length > 64)
    error(400, 'cardId required');
  const { favorites } = ctx(event);
  await favorites.addFavorite(event.locals.user.id, body.cardId);
  return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async (event) => {
  if (!event.locals.user) error(401, 'Unauthorized');
  const body = await event.request.json().catch(() => null);
  if (!body?.cardId || typeof body.cardId !== 'string' || body.cardId.length > 64)
    error(400, 'cardId required');
  const { favorites } = ctx(event);
  await favorites.removeFavorite(event.locals.user.id, body.cardId);
  return new Response(null, { status: 204 });
};
