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
  if (raw !== canonical) redirect(308, `/${canonical}`);

  const publicDecks = await decks.listPublicDecks(resolved.user.id);

  return {
    profile: {
      displayName: resolved.user.display_name,
      atName: resolved.atName,
      isBsky: resolved.isBsky,
    },
    decks: publicDecks,
  };
};
