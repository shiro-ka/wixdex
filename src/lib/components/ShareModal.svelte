<script lang="ts">
  import type { Card } from '$lib/types';
  import { browser } from '$app/environment';
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
    deckId: string | null;
    isPublic: boolean;
    isLoggedIn: boolean;
    onSetPublic: (next: boolean) => void | Promise<void>;
  }

  let { isOpen, onClose, deckName, mainDeck, lrigDeck, deckId, isPublic, isLoggedIn, onSetPublic }: Props = $props();

  let isExporting = $state(false);
  let publishing = $state(false);
  let copied = $state(false);

  let publicUrl = $derived(browser && deckId ? `${location.origin}/d/${deckId}` : '');

  async function togglePublish() {
    if (publishing) return;
    publishing = true;
    try {
      await onSetPublic(!isPublic);
    } finally {
      publishing = false;
    }
  }

  async function copyLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      copied = true;
      setTimeout(() => { copied = false; }, 1500);
    } catch {
      /* clipboard 拒否時は無視 */
    }
  }

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
    <!-- デッキ公開 -->
    <div>
      <h4 class="text-white text-sm font-semibold mb-2">デッキを公開</h4>
      {#if !isLoggedIn}
        <p class="text-gray-400 text-xs">ログインするとデッキを公開・共有できます。</p>
      {:else if !deckId}
        <p class="text-gray-400 text-xs">デッキを保存すると公開・共有できます。</p>
      {:else}
        <div class="flex items-center justify-between">
          <span class="text-gray-300 text-sm">このデッキを公開する</span>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="このデッキを公開する"
            onclick={togglePublish}
            disabled={publishing}
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 {isPublic ? 'bg-orange-600' : 'bg-zinc-600'}"
          >
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {isPublic ? 'translate-x-6' : 'translate-x-1'}"></span>
          </button>
        </div>
        {#if isPublic}
          <div class="flex h-9 gap-2 mt-3">
            <input
              type="text"
              readonly
              value={publicUrl}
              class="flex-1 px-2 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-300 text-xs select-all focus:outline-none"
            />
            <button
              type="button"
              onclick={copyLink}
              class="flex items-center gap-1 px-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white text-xs transition-colors"
            >
              <IconClipboard size={16} />
              {copied ? 'コピー済' : 'コピー'}
            </button>
          </div>
          <p class="text-gray-500 text-xs mt-1">リンクを知っている人がこのデッキを閲覧できます。</p>
        {/if}
      {/if}
    </div>

    <!-- 画像エクスポート -->
    <div class="pt-4 border-t border-zinc-700">
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
