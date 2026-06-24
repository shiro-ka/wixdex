import { clearDraft } from './storage';

/**
 * ログアウト処理を一本化する。
 * サーバセッションを破棄し、開いていたデッキの下書き(localStorage)も消してから、
 * トップへハード遷移する。ハード遷移にすることで SvelteKit のクライアント状態
 * (ログイン情報・編集中デッキ)を確実にまっさらにする。
 * (/api/auth/logout は 204 を返すので、遷移はこちらで明示的に行う必要がある)
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    /* ネットワーク失敗でもローカルはクリアして遷移する */
  }
  clearDraft();
  window.location.href = '/';
}
