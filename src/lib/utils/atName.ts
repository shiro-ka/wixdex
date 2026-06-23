// @ハンドル(URLの @ より後ろ)に関する純粋ユーティリティ。クライアント/サーバー共用。
//
// 名前空間の分離ルール:
//   - メアド勢の username … [a-z0-9_-] のみ（ドット禁止）
//   - bsky勢の handle     … 必ずドットを含むドメイン（alice.bsky.social 等）
// → ドットの有無だけで「これは username か handle か」を曖昧さなく判定できる。

import { customAlphabet } from 'nanoid';

/** username に使える文字数・文字種。 */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
const USERNAME_RE = /^[a-z0-9_-]+$/;

/**
 * アプリのルートや特別な意味を持つため username に使わせない語。
 * 全員 @ 始まりなので `/@login` と `/login` は衝突しないが、
 * なりすまし/紛らわしさ防止のため最小限を予約する。
 */
export const RESERVED_USERNAMES = new Set([
  'account', 'settings', 'login', 'logout', 'signup', 'signin', 'register',
  'api', 'd', 'deck', 'decks', 'stats', 'admin', 'about', 'help', 'terms',
  'privacy', 'static', 'assets', 'favicon', 'robots', 'sitemap', 'new',
  'me', 'you', 'null', 'undefined', 'support', 'official',
  'og', 'profile', 'user', 'users', 'home', 'search',
]);

/**
 * 部分一致でブロックする語（なりすまし防止）。`wixdex` を含む名前は全て弾く。
 * 一般語(api/me等)を入れると誤爆するので、造語など誤爆しないものだけ入れること。
 */
export const BLOCKED_SUBSTRINGS = ['wixdex'];

function hasBlockedSubstring(name: string): boolean {
  return BLOCKED_SUBSTRINGS.some((s) => name.includes(s));
}

/** 小文字化・トリム。保存も照合もこの正規形で行う。 */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** 「@より後ろ」がbskyハンドル(=ドットを含む)かどうか。 */
export function isHandle(atName: string): boolean {
  return atName.includes('.');
}

/** username として妥当か（正規化済み前提でないので内部で正規化して判定）。 */
export function isValidUsername(raw: string): boolean {
  const name = normalizeUsername(raw);
  if (name.length < USERNAME_MIN || name.length > USERNAME_MAX) return false;
  if (!USERNAME_RE.test(name)) return false;
  if (RESERVED_USERNAMES.has(name)) return false;
  if (hasBlockedSubstring(name)) return false;
  return true;
}

/** 入力をチェックして理由付きで返す（フォームのバリデーション用）。 */
export function validateUsername(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const name = normalizeUsername(raw);
  if (name.length < USERNAME_MIN) return { ok: false, error: `${USERNAME_MIN}文字以上にしてください。` };
  if (name.length > USERNAME_MAX) return { ok: false, error: `${USERNAME_MAX}文字以下にしてください。` };
  if (!USERNAME_RE.test(name)) return { ok: false, error: '使えるのは英小文字・数字・ハイフン・アンダースコアです。' };
  if (RESERVED_USERNAMES.has(name)) return { ok: false, error: 'このユーザー名は使用できません。' };
  if (hasBlockedSubstring(name)) return { ok: false, error: 'このユーザー名は使用できません。' };
  return { ok: true, value: name };
}

/** デッキ公開URLの slug 検証。/@user/[slug] のユーザー内名前空間用（予約語は不要）。 */
export const SLUG_MAX = 50;
const SLUG_RE = /^[a-z0-9_-]+$/;

export function validateSlug(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const slug = raw.trim().toLowerCase();
  if (slug.length < 1) return { ok: false, error: 'URLを入力してください。' };
  if (slug.length > SLUG_MAX) return { ok: false, error: `${SLUG_MAX}文字以下にしてください。` };
  if (!SLUG_RE.test(slug)) return { ok: false, error: '使えるのは英小文字・数字・ハイフン・アンダースコアです。' };
  return { ok: true, value: slug };
}

const randomChars = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 8);

/** ランダムな username 候補を生成（登録時の「おまかせ」ボタン用）。 */
export function randomUsername(): string {
  return `wx-${randomChars()}`;
}
