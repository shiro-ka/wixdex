export type TagIndex = Record<string, { name: string; count: number }[]>;

let cache: Promise<TagIndex> | null = null;

export function loadTagIndex(fetchImpl: typeof fetch = fetch): Promise<TagIndex> {
  cache ??= fetchImpl('/assets/cards_json/tags.json')
    .then((r) => {
      if (!r.ok) throw new Error(`tags.json: ${r.status}`);
      return r.json() as Promise<TagIndex>;
    })
    .catch(() => {
      cache = null;
      return {};
    });
  return cache;
}

export function tagKinds(index: TagIndex): Map<string, string> {
  const kinds = new Map<string, string>();
  for (const [kind, tags] of Object.entries(index)) {
    for (const t of tags) kinds.set(t.name, kind);
  }
  return kinds;
}
