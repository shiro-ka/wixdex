<script lang="ts">
  import IconShare from '@tabler/icons-svelte/icons/share';
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
  import IconDeviceFloppyFilled from '@tabler/icons-svelte/icons/device-floppy-filled';
  import IconMenu2 from '@tabler/icons-svelte/icons/menu-2';
  import { navBtn } from '$lib/styles';
  import clsx from 'clsx';

  interface Props {
    deckName: string;
    isSaved: boolean;
    isLoggedIn: boolean;
    onMenuClick: () => void;
    onSaveClick: () => void;
    onDeckClick: () => void;
    onShareClick: () => void;
  }

  let { deckName, isSaved, isLoggedIn, onMenuClick, onSaveClick, onDeckClick, onShareClick }: Props = $props();
</script>

<nav class="flex-shrink-0">
  <div class="flex items-center justify-between px-4 py-2">
    <img src="/wixdex.png" alt="wixdex" class="h-7" />
    <div class="flex items-center gap-4">
      <div class="flex items-center border border-gray-600 rounded-lg">
        <button
          class={clsx(navBtn(), 'pl-6 pr-2 h-10')}
          onclick={onDeckClick} aria-label="デッキ"
        >
          <span class="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{deckName || '新しいデッキ'}</span>
        </button>
        <button
          class={clsx(navBtn(), 'w-10 h-10')}
          onclick={onShareClick} aria-label="シェア"
        >
          <IconShare class="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors" />
        </button>
        <button
          class={clsx(navBtn({ interactive: isLoggedIn }), 'w-12 h-10 pr-2')}
          onclick={isLoggedIn ? onSaveClick : undefined}
          disabled={!isLoggedIn}
          aria-label="保存"
        >
          {#if isSaved}
            <IconDeviceFloppyFilled class="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors" />
          {:else}
            <IconDeviceFloppy class="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />
          {/if}
        </button>
      </div>
      <button
        class={clsx(navBtn(), 'w-10 h-10 rounded-lg')}
        onclick={onMenuClick} aria-label="メニュー"
      >
        <IconMenu2 class="w-6 h-6 text-gray-400 group-hover:text-gray-200 transition-colors" />
      </button>
    </div>
  </div>
</nav>
