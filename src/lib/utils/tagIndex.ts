/**
 * タグ一覧（tags.json）の読み込み。カードデータと一緒に生成される。
 * 形は `{ 種類: [{ name, count }] }`（種類は チーム / キーワード / クラス。枚数の多い順）。
 *
 * ★タグ検索の選択肢とカード詳細のタグ表示が同じものを読むので、取得は1回にまとめる。
 */
export type TagIndex = Record<string, { name: string; count: number }[]>;

let cache: Promise<TagIndex> | null = null;

export function loadTagIndex(fetchImpl: typeof fetch = fetch): Promise<TagIndex> {
  cache ??= fetchImpl('/assets/cards_json/tags.json')
    .then((r) => {
      if (!r.ok) throw new Error(`tags.json: ${r.status}`);
      return r.json() as Promise<TagIndex>;
    })
    .catch(() => {
      // 失敗は覚えない（次に開いたとき取り直す）
      cache = null;
      return {};
    });
  return cache;
}

/** タグ名 → 種類 */
export function tagKinds(index: TagIndex): Map<string, string> {
  const kinds = new Map<string, string>();
  for (const [kind, tags] of Object.entries(index)) {
    for (const t of tags) kinds.set(t.name, kind);
  }
  return kinds;
}
