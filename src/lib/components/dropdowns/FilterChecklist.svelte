<script lang="ts">
  import CheckboxIcon from '../icons/CheckboxIcon.svelte';

  type Item = { value: string; label: string };

  interface Props {
    items?: Item[];
    groups?: { title: string; items: Item[] }[];
    selected: Set<string>;
    onToggle: (value: string) => void;
    columns?: number;
  }
  let { items = [], groups, selected, onToggle, columns = 2 }: Props = $props();

  const blocks = $derived(groups ?? [{ title: '', items }]);
</script>

<div class="scroll">
  {#each blocks as block (block.title)}
    {#if block.title}
      <p data-suisou-text="fs-14 fw-700" class="group">{block.title}</p>
    {/if}
    <div data-suisou-layout="grid gap-2" style="--suisou-grid-cols: repeat({columns}, minmax(0, 1fr))">
      {#each block.items as { value, label } (value)}
        {@const checked = selected.has(value)}
        <button type="button" class="toggle" data-suisou-text="fs-12" aria-pressed={checked} onclick={() => onToggle(value)} data-suisou-layout="row gap-2">
          <CheckboxIcon
            {checked}
            data-suisou-text="fs-16"
          />
          <span>{label}</span>
        </button>
      {/each}
    </div>
  {/each}
</div>

<style>
  .scroll {
    max-height: 48dvh;
    overflow-y: auto;
  }
  .group {
    color: var(--suisou-color-text-sub);
    margin-block: var(--suisou-space-3) var(--suisou-space-1);
  }
  .group:first-child {
    margin-block-start: 0;
  }
  .toggle {
    cursor: pointer;
    justify-content: flex-start;
    padding: 0;
    border: 0;
  }

  .toggle :global(svg) {
    color: var(--suisou-color-text-sub);
    transition: color var(--suisou-duration-fast) var(--suisou-ease);
  }
  .toggle:hover :global(svg) {
    color: var(--suisou-color-text);
  }
  .toggle[aria-pressed="true"] :global(svg) {
    color: var(--suisou-color-accent);
  }
</style>
