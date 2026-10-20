<script lang="ts">
  import CheckboxIcon from './icons/CheckboxIcon.svelte';

  interface Props {
    id: string;
    ontoggle: (e: ToggleEvent) => void;
    searchCardName: boolean;
    searchCardText: boolean;
    onToggleSearchCardName: () => void;
    onToggleSearchCardText: () => void;
  }

  let {
    id,
    ontoggle,
    searchCardName,
    searchCardText,
    onToggleSearchCardName,
    onToggleSearchCardText,
  }: Props = $props();
</script>

<div popover {id} data-suisou-tray="popup" class="popup" {ontoggle}>
  <h3 data-suisou-text="fs-14 fw-700">テキスト検索設定</h3>
  <div data-suisou-layout="stack">
    <button type="button" class="toggle" data-suisou-text="fs-12" aria-pressed={searchCardName} onclick={onToggleSearchCardName} data-suisou-layout="row">
      <CheckboxIcon
        checked={searchCardName}
        data-suisou-text="fs-16"
      />
      <span>カード名</span>
    </button>
    <button type="button" class="toggle" data-suisou-text="fs-12" aria-pressed={searchCardText} onclick={onToggleSearchCardText} data-suisou-layout="row">
      <CheckboxIcon
        checked={searchCardText}
        data-suisou-text="fs-16"
      />
      <span>テキスト</span>
    </button>
  </div>
</div>

<style>
  .toggle {
    width: 100%;
    cursor: pointer;
    justify-content: flex-start;
    padding: 0;
    border: 0;
  }
  .popup {
    width: 16rem;
  }

  .toggle :global(svg) {
    color: var(--suisou-color-text-note);
    transition: color var(--suisou-duration-fast) var(--suisou-ease);
  }
  .toggle:hover :global(svg) {
    color: var(--suisou-color-text);
  }
  .toggle[aria-pressed="true"] :global(svg) {
    color: var(--suisou-color-accent);
  }
</style>
