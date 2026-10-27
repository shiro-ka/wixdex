
import { customAlphabet } from 'nanoid';

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_RE = /^[a-z0-9_-]+$/;

const RESERVED_USERNAMES = new Set([
  'account', 'settings', 'login', 'logout', 'signup', 'signin', 'register',
  'api', 'd', 'deck', 'decks', 'stats', 'admin', 'about', 'help', 'terms',
  'privacy', 'static', 'assets', 'favicon', 'robots', 'sitemap', 'new',
  'me', 'you', 'null', 'undefined', 'support', 'official',
  'og', 'profile', 'user', 'users', 'home', 'search',
]);

const BLOCKED_SUBSTRINGS = ['wixdex'];

function matchedBlockedSubstring(name: string): string | null {
  return BLOCKED_SUBSTRINGS.find((s) => name.includes(s)) ?? null;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isHandle(atName: string): boolean {
  return atName.includes('.');
}

export function validateUsername(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const name = normalizeUsername(raw);
  if (name.length < USERNAME_MIN) return { ok: false, error: `${USERNAME_MIN}文字以上にしてください。` };
  if (name.length > USERNAME_MAX) return { ok: false, error: `${USERNAME_MAX}文字以下にしてください。` };
  if (!USERNAME_RE.test(name)) return { ok: false, error: '使えるのは英小文字・数字・ハイフン・アンダースコアです（@ や . は使えません）。' };
  if (RESERVED_USERNAMES.has(name)) return { ok: false, error: 'このユーザー名は使用できません。' };
  const blocked = matchedBlockedSubstring(name);
  if (blocked) return { ok: false, error: `「${blocked}」を含む名前は使用できません。` };
  return { ok: true, value: name };
}

const SLUG_MAX = 50;
const SLUG_RE = /^[a-z0-9_-]+$/;

export function validateSlug(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const slug = raw.trim().toLowerCase();
  if (slug.length < 1) return { ok: false, error: 'URLを入力してください。' };
  if (slug.length > SLUG_MAX) return { ok: false, error: `${SLUG_MAX}文字以下にしてください。` };
  if (!SLUG_RE.test(slug)) return { ok: false, error: '使えるのは英小文字・数字・ハイフン・アンダースコアです。' };
  return { ok: true, value: slug };
}

const randomChars = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 8);

export function randomUsername(): string {
  return `wx-${randomChars()}`;
}
