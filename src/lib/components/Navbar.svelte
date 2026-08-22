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

<!-- デッキ名 + 共有 + 保存は連結ボタン（button-group）。
     親が罫と角丸を持ち、子は罫なしで並ぶ —— Suisou がこの形を部品で持っている -->
<nav class="bar">
  <img src="/wixdex.png" alt="wixdex" class="logo" />
  <div data-suisou-layout="row">
    <div data-suisou-button-group>
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
  /* トップバーは地べた（bg）に直置き。面も罫も持たず、区切りは空きが担う */
  .bar {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--suisou-space-2) var(--suisou-space-3);
  }
  .logo {
    height: 1.75rem; /* 28px。ロゴの実寸は現場の値 */
  }
</style>
