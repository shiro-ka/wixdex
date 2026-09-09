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

<div class="scroll">
  <div data-suisou-layout="cols gap-2" style="--suisou-cols: {columns}">
    {#each items as { value, label } (value)}
      {@const checked = selected.has(value)}
      <button type="button" class="toggle" aria-pressed={checked} onclick={() => onToggle(value)} data-suisou-layout="row gap-2">
        <CheckboxIcon
          {checked}
          data-suisou-icon
        />
        <span>{label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .scroll {
    max-height: 48dvh;
    overflow-y: auto;
  }
  .toggle {
    cursor: pointer;
  }

  /* ★色は aria-pressed から引く。三項式でもう一度状態を書かないこと ――
     「押されているか」が属性と式の2箇所に散る。 */
  .toggle :global(svg) {
    color: var(--suisou-text-sub);
    transition: color var(--suisou-motion-fast) var(--suisou-ease);
  }
  .toggle:hover :global(svg) {
    color: var(--suisou-text-main);
  }
  .toggle[aria-pressed="true"] :global(svg) {
    color: var(--suisou-accent);
  }
</style>
