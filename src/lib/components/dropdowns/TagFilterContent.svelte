<script lang="ts">
  import FilterChecklist from './FilterChecklist.svelte';

  interface Props {
    selectedTags: Set<string>;
    onToggle: (tag: string) => void;
  }
  let { selectedTags, onToggle }: Props = $props();

  const tags = [
    '解放派', '闘争派', '防衛派', '開放派',
    '夢限少女', 'ゲート', 'アンシエント・サプライズ',
    'チームピース', 'CardJockey', 'NoLimit', 'デウス・エクス・マキナ',
    'うちゅうのはじまり', 'きゅるきゅるーん',
    'DIAGRAM', 'ディソナ', 'ライズ', 'アタックフェイズ',
    'サーバント', '原子', '地獣', '悪魔',
  ];
  const items = tags.map((t) => ({ value: t, label: t }));
</script>

<FilterChecklist {items} selected={selectedTags} {onToggle} columns={2} />
