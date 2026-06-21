export type StartBlueskyAuthResult = { ok: true } | { ok: false; error: string };

export async function startBlueskyAuth(handle?: string): Promise<StartBlueskyAuthResult> {
  const trimmed = handle?.trim() ?? '';
  try {
    // ハンドル省略時はサーバー側で bsky.social へ直行（入力不要のGoogle方式）。
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trimmed ? { handle: trimmed } : {}),
    });
    const json = (await res.json()) as { redirectUrl?: string; message?: string };
    if (!res.ok) return { ok: false, error: json.message ?? 'エラーが発生しました。' };
    if (!json.redirectUrl) return { ok: false, error: 'リダイレクトURLが取得できませんでした。' };
    window.location.href = json.redirectUrl;
    return { ok: true };
  } catch {
    return { ok: false, error: 'ネットワークエラーが発生しました。' };
  }
}
