<script lang="ts">
  import CheckboxIcon from '../icons/CheckboxIcon.svelte';

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
</script>

<div class="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
  {#each tags as tag (tag)}
    {@const checked = selectedTags.has(tag)}
    <button type="button" class="group flex items-center space-x-2 text-white cursor-pointer" onclick={() => onToggle(tag)}>
      <CheckboxIcon
        {checked}
        class="w-5 h-5 flex-shrink-0 transition-colors {checked ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-300'}"
      />
      <span class="text-sm">{tag}</span>
    </button>
  {/each}
</div>
