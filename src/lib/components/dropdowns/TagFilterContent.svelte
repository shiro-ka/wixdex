<script lang="ts">
  import FilterChecklist from './FilterChecklist.svelte';

  interface Props {
    selectedTags: Set<string>;
    onToggle: (tag: string) => void;
  }
  let { selectedTags, onToggle }: Props = $props();

  /** tags.json：{ 種類: [{ name, count }] }（種類は チーム / キーワード / クラス。枚数の多い順） */
  type TagIndex = Record<string, { name: string; count: number }[]>;

  // ★選択肢は手で書かず、カードデータと一緒に生成される tags.json から作る。
  //   手書きの一覧は公式の表記とずれて、選んでも1枚も出ないタグができていた
  //   （NoLimit / CardJockey / きゅるきゅるーん と、データ側の No Limit / Card Jockey / きゅるきゅるーん☆）。
  let index = $state<TagIndex>({});
  $effect(() => {
    fetch('/assets/cards_json/tags.json')
      .then((r) => (r.ok ? r.json() : {}))
      .then((j: TagIndex) => {
        index = j;
      })
      .catch(() => {});
  });

  const groups = $derived(
    Object.entries(index)
      .filter(([, tags]) => tags.length > 0)
      .map(([title, tags]) => ({ title, items: tags.map((t) => ({ value: t.name, label: t.name })) })),
  );
</script>

<FilterChecklist {groups} selected={selectedTags} {onToggle} columns={2} />
