import type { Db, UserRow } from './db';
import { isHandle, normalizeUsername } from '$lib/utils/atName';

export interface ResolvedAt {
  user: UserRow;
  /** 正規形の @より後ろ（小文字handle or username）。リンク生成・正規URL判定に使う。 */
  atName: string;
  /** bskyハンドルで解決されたか（バッジ・本家リンク表示用）。 */
  isBsky: boolean;
}

/**
 * URLの `@xxx`（先頭@込み/無し どちらでも可）から実ユーザーを解決する。
 * ドット有り → bskyハンドル / 無し → username。見つからなければ null。
 */
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
