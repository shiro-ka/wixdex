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

  let { deckName, isSaved, isLoggedIn, onMenuClick, onSaveClick, onDeckClick, onShareClick }: Props = $props();
</script>

<nav class="flex-shrink-0">
  <div class="flex items-center justify-between px-4 py-2">
    <img src="/wixdex.png" alt="wixdex" class="h-7" />
    <div class="flex items-center gap-2">
      <div class="flex items-center border border-gray-600 rounded-lg overflow-hidden">
        <button
          class="!bg-transparent !pl-4 h-10 flex items-center justify-center hover:bg-gray-700/50 transition-colors"
          onclick={onDeckClick} aria-label="デッキ"
        >
          <span class="text-sm text-gray-400">{deckName || '新しいデッキ'}</span>
        </button>
        <button
          class="!bg-transparent !p-0 w-8 h-10 flex items-center justify-center hover:bg-gray-700/50 transition-colors"
          onclick={onShareClick} aria-label="シェア"
        >
          <IconShare class="w-4 h-4 text-gray-400" />
        </button>
        <button
          class="!bg-transparent !p-0 w-8 h-10 flex items-center justify-center transition-colors {isLoggedIn ? 'hover:bg-gray-700/50' : 'cursor-not-allowed opacity-40'}"
          onclick={isLoggedIn ? onSaveClick : undefined}
          disabled={!isLoggedIn}
          aria-label="保存"
        >
          {#if isSaved}
            <IconDeviceFloppyFilled class="w-4 h-4 text-gray-400" />
          {:else}
            <IconDeviceFloppy class="w-5 h-5 text-gray-400" />
          {/if}
        </button>
      </div>
      <button
        class="!bg-transparent !p-0 w-10 h-10 flex items-center justify-center hover:bg-gray-700/50 rounded-lg transition-colors"
        onclick={onMenuClick} aria-label="メニュー"
      >
        <IconMenu2 class="w-6 h-6 text-gray-400" />
      </button>
    </div>
  </div>
</nav>
