<script lang="ts">
  import type { Card } from '$lib/types';
  import BaseModal from './BaseModal.svelte';
  import { generateStackDeckImage, downloadCanvasAsImage, copyCanvasToClipboard } from '$lib/utils/deckImageExport';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    deckName: string;
    mainDeck: Card[];
    lrigDeck: Card[];
  }

  let { isOpen, onClose, deckName, mainDeck, lrigDeck }: Props = $props();

  let isExporting = $state(false);

  async function handleExportImage(format: 'png' | 'jpg') {
    if (isExporting || mainDeck.length === 0) return;
    isExporting = true;
    try {
      const canvas = await generateStackDeckImage(deckName, mainDeck, lrigDeck);
      downloadCanvasAsImage(canvas, `${deckName || 'deck'}.${format}`, format);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('画像のエクスポートに失敗しました。');
    } finally {
      isExporting = false;
    }
  }

  async function handleCopyToClipboard() {
    if (isExporting || mainDeck.length === 0) return;
    isExporting = true;
    try {
      const canvas = await generateStackDeckImage(deckName, mainDeck, lrigDeck);
      await copyCanvasToClipboard(canvas);
      alert('画像をクリップボードにコピーしました。');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('クリップボードへのコピーに失敗しました。');
    } finally {
      isExporting = false;
    }
  }
</script>

<BaseModal {isOpen} {onClose} title="シェア">
  <div class="space-y-4">
    <div>
      <h4 class="text-white text-sm font-semibold mb-2">画像エクスポート（製作中）</h4>
      <p class="text-gray-400 text-xs mb-3">スタック式デッキ画像 (16:9)</p>

      <div class="flex h-10 gap-3">
        <!-- JPG -->
        <div class="flex flex-1 px-1 bg-zinc-800 rounded-lg border border-zinc-700">
          <div class="flex flex-1 text-white font-medium text-sm items-center justify-center">JPG</div>
          <button
            class="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={handleCopyToClipboard}
            disabled={isExporting || mainDeck.length === 0}
            title="クリップボードにコピー"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-white">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
              <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
            </svg>
          </button>
          <button
            class="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={() => handleExportImage('jpg')}
            disabled={isExporting || mainDeck.length === 0}
            title="ダウンロード"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-white">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
              <path d="M7 11l5 5l5 -5" />
              <path d="M12 4l0 12" />
            </svg>
          </button>
        </div>

        <!-- PNG -->
        <div class="flex flex-1 px-1 bg-zinc-800 rounded-lg border border-zinc-700">
          <div class="flex flex-1 text-white font-medium text-sm items-center justify-center">PNG</div>
          <button
            class="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={handleCopyToClipboard}
            disabled={isExporting || mainDeck.length === 0}
            title="クリップボードにコピー"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-white">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
              <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
            </svg>
          </button>
          <button
            class="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={() => handleExportImage('png')}
            disabled={isExporting || mainDeck.length === 0}
            title="ダウンロード"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-white">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
              <path d="M7 11l5 5l5 -5" />
              <path d="M12 4l0 12" />
            </svg>
          </button>
        </div>
      </div>

      {#if mainDeck.length === 0}
        <p class="text-yellow-500 text-xs mt-3">※デッキにカードを追加してください</p>
      {/if}
      {#if isExporting}
        <p class="text-gray-400 text-xs mt-3">生成中...</p>
      {/if}
    </div>

    <div class="pt-4 border-t border-zinc-700">
      <p class="text-gray-500 text-xs">リスト式、テキストエクスポートは今後実装予定です。</p>
    </div>
  </div>
</BaseModal>
