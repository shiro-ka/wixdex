<script lang="ts">
  import FilterChecklist from './FilterChecklist.svelte';

  interface Props {
    selectedLrigClasses: Set<string>;
    onToggle: (lrigClass: string) => void;
  }
  let { selectedLrigClasses, onToggle }: Props = $props();

  /** classes.json：[{ title, items: [{ value, label, count }] }]（ルリグタイプ → 奏像・奏武… → その他。枚数の多い順） */
  type ClassGroup = { title: string; items: { value: string; label: string; count: number }[] };

  // ★選択肢は手で書かず、カードデータと一緒に生成される classes.json から作る。
  //   値は lrigTypeClass の値そのもの（シグニは「奏像：悪魔」）、表示は「：」の後ろ。
  //   手書きの一覧は「悪魔」だけを値にしていて、シグニのクラスで絞ると1枚も出なかった（2026-09-13 に本番で確認）。
  let groups = $state<ClassGroup[]>([]);
  $effect(() => {
    fetch('/assets/cards_json/classes.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((j: ClassGroup[]) => {
        groups = j;
      })
      .catch(() => {});
  });
</script>

<FilterChecklist {groups} selected={selectedLrigClasses} {onToggle} columns={3} />
