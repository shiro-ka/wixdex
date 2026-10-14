<script lang="ts">
  import CheckboxIcon from '../icons/CheckboxIcon.svelte';

  type Item = { value: string; label: string };

  interface Props {
    /** 見出しなしで並べる選択肢。groups を渡したときは使わない */
    items?: Item[];
    /** 見出しごとに分けて並べる選択肢（例：タグの チーム / キーワード / クラス） */
    groups?: { title: string; items: Item[] }[];
    selected: Set<string>;
    onToggle: (value: string) => void;
    columns?: number;
  }
  let { items = [], groups, selected, onToggle, columns = 2 }: Props = $props();

  // ★見出しの有無で描き分けない。見出しなしは「タイトル空の1グループ」として同じ道を通す
  const blocks = $derived(groups ?? [{ title: '', items }]);
</script>

<div class="scroll">
  {#each blocks as block (block.title)}
    {#if block.title}
      <p data-suisou-text="fs-14 fw-700" class="group">{block.title}</p>
    {/if}
    <div data-suisou-layout="grid gap-2" style="--suisou-cols: {columns}">
      {#each block.items as { value, label } (value)}
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
  }

  /* ★色は aria-pressed から引く。三項式でもう一度状態を書かないこと ――
     「押されているか」が属性と式の2箇所に散る。 */
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
