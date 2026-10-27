import type { Db, UserRow } from './db';
import { isHandle, normalizeUsername } from '$lib/utils/atName';

export interface ResolvedAt {
  user: UserRow;
  atName: string;
  isBsky: boolean;
}

export async function resolveAtName(db: Db, raw: string): Promise<ResolvedAt | null> {
  const atName = raw.startsWith('@') ? raw.slice(1) : raw;
  if (!atName) return null;

  if (isHandle(atName)) {
    const user = await db.getUserByHandle(atName.toLowerCase());
    if (!user || !user.bluesky_handle) return null;
    return { user, atName: user.bluesky_handle, isBsky: true };
  }

  const user = await db.getUserByUsername(normalizeUsername(atName));
  if (!user || !user.username) return null;
  return { user, atName: user.username, isBsky: false };
}
