// パスワード再設定トークンの生成・ハッシュ。
// トークンそのものはメールリンクにだけ載せ、KV には SHA-256 ハッシュをキーにして保存する
// → KV が漏れてもリセットには使えない。検証時は受け取ったトークンを同じくハッシュして突き合わせる。

/** 再設定トークンの有効期限(秒)。 */
export const RESET_TTL = 30 * 60; // 30分

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** URLに載せる秘密トークン(256bit乱数)。 */
export function generateResetToken(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return toBase64Url(b);
}

/** KVキー用のトークンハッシュ。 */
export async function hashResetToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return toBase64Url(new Uint8Array(digest));
}
