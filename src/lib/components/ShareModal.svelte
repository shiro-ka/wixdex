<script lang="ts">
  import type { Card } from '$lib/types';
  import BaseModal from './BaseModal.svelte';
  import IconClipboard from '@tabler/icons-svelte/icons/clipboard';
  import IconDownload from '@tabler/icons-svelte/icons/download';
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
            <IconClipboard size={20} class="mx-auto text-white" />
          </button>
          <button
            class="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={() => handleExportImage('jpg')}
            disabled={isExporting || mainDeck.length === 0}
            title="ダウンロード"
          >
            <IconDownload size={20} class="mx-auto text-white" />
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
            <IconClipboard size={20} class="mx-auto text-white" />
          </button>
          <button
            class="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={() => handleExportImage('png')}
            disabled={isExporting || mainDeck.length === 0}
            title="ダウンロード"
          >
            <IconDownload size={20} class="mx-auto text-white" />
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
