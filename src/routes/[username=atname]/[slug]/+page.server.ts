import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';
import { resolveAtName } from '$lib/server/resolveUser';

export const load: PageServerLoad = async (event) => {
  const { db, decks } = ctx(event);
  const raw = event.params.username;

  const resolved = await resolveAtName(db, raw);
  if (!resolved) error(404, 'ユーザーが見つかりません');

  const canonical = `@${resolved.atName}`;
  if (raw !== canonical) redirect(308, `/${canonical}/${event.params.slug}`);

  const deck = await decks.getPublicDeckBySlug(resolved.user.id, event.params.slug);
  if (!deck) error(404, 'このデッキは存在しないか、非公開です。');

  return { deck, atName: resolved.atName };
};
