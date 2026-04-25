<script lang="ts">
  import CheckboxIcon from '../icons/CheckboxIcon.svelte';

  interface Props {
    selectedTypes: Set<string>;
    onToggle: (type: string) => void;
  }
  let { selectedTypes, onToggle }: Props = $props();

  const types: [string, string][] = [
    ['ルリグ', 'ルリグ（センター）'],
    ['アシスト', 'アシストルリグ'],
    ['ピース', 'ピース'],
    ['アーツ', 'アーツ'],
    ['シグニ', 'シグニ'],
    ['スペル', 'スペル'],
  ];
</script>

<div class="grid grid-cols-2 gap-3">
  {#each types as [value, label] (value)}
    {@const checked = selectedTypes.has(value)}
    <button type="button" class="group flex items-center space-x-2 text-white cursor-pointer" onclick={() => onToggle(value)}>
      <CheckboxIcon
        {checked}
        class="w-5 h-5 flex-shrink-0 transition-colors {checked ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-300'}"
      />
      <span class="text-sm">{label}</span>
    </button>
  {/each}
</div>
