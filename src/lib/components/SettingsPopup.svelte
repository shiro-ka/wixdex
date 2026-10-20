<script lang="ts">
  import CheckboxIcon from './icons/CheckboxIcon.svelte';
  import type { SettingsStore } from '$lib/stores/settings.svelte';

  interface Props {
    id: string;
    settings: SettingsStore;
  }

  let { id, settings }: Props = $props();
</script>

<div popover {id} data-suisou-tray="popup" class="popup">
  <h3 data-suisou-text="fs-14 fw-700" class="sec-head">設定</h3>
  <div data-suisou-layout="stack">
    <button type="button" class="toggle" data-suisou-text="fs-12" aria-pressed={settings.showLifeBurst} onclick={() => settings.toggle('showLifeBurst')} data-suisou-layout="row">
      <CheckboxIcon
        checked={settings.showLifeBurst}
        data-suisou-text="fs-16"
      />
      <span>LBアイコンを表示</span>
    </button>
    <button type="button" class="toggle" data-suisou-text="fs-12" aria-pressed={settings.showCandidateIcon} onclick={() => settings.toggle('showCandidateIcon')} data-suisou-layout="row">
      <CheckboxIcon
        checked={settings.showCandidateIcon}
        data-suisou-text="fs-16"
      />
      <span>候補カードアイコンを表示</span>
    </button>
    <button type="button" class="toggle" data-suisou-text="fs-12" aria-pressed={settings.rotateLandscape} onclick={() => settings.toggle('rotateLandscape')} data-suisou-layout="row">
      <CheckboxIcon
        checked={settings.rotateLandscape}
        data-suisou-text="fs-16"
      />
      <span>横向きのカードを縦に表示</span>
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
