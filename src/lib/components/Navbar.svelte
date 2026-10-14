<script lang="ts">
  import IconShare from '@tabler/icons-svelte/icons/share';
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
  import IconDeviceFloppyFilled from '@tabler/icons-svelte/icons/device-floppy-filled';
  import IconMenu2 from '@tabler/icons-svelte/icons/menu-2';

  interface Props {
    deckName: string;
    isSaved: boolean;
    isLoggedIn: boolean;
    onMenuClick: () => void;
    onSaveClick: () => void;
    onDeckClick: () => void;
    onShareClick: () => void;
  }

  let {
    deckName,
    isSaved,
    isLoggedIn,
    onMenuClick,
    onSaveClick,
    onDeckClick,
    onShareClick,
  }: Props = $props();
</script>

<nav class="bar">
  <img src="/wixdex.png" alt="wixdex" class="logo" />
  <div data-suisou-layout="row">
    <div data-suisou-tray data-suisou-layout="row gap-0" data-suisou="bg-none py-0">
      <button data-suisou-button type="button" onclick={onDeckClick} aria-label="デッキ">
        {deckName || '新しいデッキ'}
      </button>
      <button data-suisou-button="icon" type="button" onclick={onShareClick} aria-label="シェア">
        <IconShare />
      </button>
      <button
        data-suisou-button="icon"
        type="button"
        onclick={isLoggedIn ? onSaveClick : undefined}
        disabled={!isLoggedIn}
        aria-label="保存"
      >
        {#if isSaved}
          <IconDeviceFloppyFilled />
        {:else}
          <IconDeviceFloppy />
        {/if}
      </button>
    </div>
    <button data-suisou-button="icon" type="button" onclick={onMenuClick} aria-label="メニュー">
      <IconMenu2 />
    </button>
  </div>
</nav>

<style>
  .bar {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--suisou-space-2) var(--suisou-space-3);
  }
  .logo {
    height: 1.75rem;
  }
</style>
