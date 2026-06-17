<script lang="ts">
  import CheckboxIcon from '../icons/CheckboxIcon.svelte';

  interface Props {
    items: { value: string; label: string }[];
    selected: Set<string>;
    onToggle: (value: string) => void;
    columns?: number;
  }
  let { items, selected, onToggle, columns = 2 }: Props = $props();
</script>

<div class="max-h-[48dvh] overflow-y-auto">
  <div class="grid gap-2" style="grid-template-columns: repeat({columns}, minmax(0, 1fr))">
    {#each items as { value, label } (value)}
      {@const checked = selected.has(value)}
      <button type="button" class="group flex items-center space-x-2 text-white cursor-pointer" onclick={() => onToggle(value)}>
        <CheckboxIcon
          {checked}
          class="w-5 h-5 flex-shrink-0 transition-colors {checked ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-300'}"
        />
        <span class="text-sm">{label}</span>
      </button>
    {/each}
  </div>
</div>
