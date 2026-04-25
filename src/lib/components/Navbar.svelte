<script lang="ts">
  interface Props {
    deckName: string;
    isSaved: boolean;
    onMenuClick: () => void;
    onSaveClick: () => void;
    onDeckClick: () => void;
    onShareClick: () => void;
  }

  let { deckName, isSaved, onMenuClick, onSaveClick, onDeckClick, onShareClick }: Props = $props();
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
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
          </svg>
        </button>
        <button
          class="!bg-transparent !p-0 w-8 h-10 flex items-center justify-center hover:bg-gray-700/50 transition-colors"
          onclick={onSaveClick} aria-label="保存"
        >
          {#if isSaved}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-4 h-4 text-gray-400" fill="currentColor">
              <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm32 96c0-17.7 14.3-32 32-32l160 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="w-5 h-5 text-gray-400" fill="currentColor">
              <path d="M160 144C151.2 144 144 151.2 144 160L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 237.3C496 233.1 494.3 229 491.3 226L416 150.6L416 240C416 257.7 401.7 272 384 272L224 272C206.3 272 192 257.7 192 240L192 144L160 144zM240 144L240 224L368 224L368 144L240 144zM96 160C96 124.7 124.7 96 160 96L402.7 96C419.7 96 436 102.7 448 114.7L525.3 192C537.3 204 544 220.3 544 237.3L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM256 384C256 348.7 284.7 320 320 320C355.3 320 384 348.7 384 384C384 419.3 355.3 448 320 448C284.7 448 256 419.3 256 384z" />
            </svg>
          {/if}
        </button>
      </div>
      <button
        class="!bg-transparent !p-0 w-10 h-10 flex items-center justify-center hover:bg-gray-700/50 rounded-lg transition-colors"
        onclick={onMenuClick} aria-label="メニュー"
      >
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</nav>
