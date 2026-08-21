<script lang="ts">
  import type { Card } from '$lib/types';
  import { browser } from '$app/environment';
  import BaseModal from './BaseModal.svelte';
  import IconClipboard from '@tabler/icons-svelte/icons/clipboard';
  import IconDownload from '@tabler/icons-svelte/icons/download';
  import IconSun from '@tabler/icons-svelte/icons/sun';
  import IconMoon from '@tabler/icons-svelte/icons/moon';
  import {
    generateDeckImage,
    downloadCanvasAsImage,
    copyCanvasToClipboard,
    type DeckImageTheme,
  } from '$lib/utils/deckImageExport';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    deckName: string;
    mainDeck: Card[];
    lrigDeck: Card[];
    deckId: string | null;
    /** 公開URLのユーザー名部分(username or bskyハンドル)。未設定なら URL を発行できない。 */
    ownerAtName: string | null;
    /** デッキ公開URLの slug（現在値）。 */
    currentSlug: string | null;
    isPublic: boolean;
    isLoggedIn: boolean;
    rotateLandscape: boolean;
    onSetPublic: (next: boolean) => void | Promise<void>;
    onUpdateSlug: (slug: string) => Promise<{ ok: boolean; error?: string; slug?: string }>;
  }

  let {
    isOpen,
    onClose,
    deckName,
    mainDeck,
    lrigDeck,
    deckId,
    ownerAtName,
    currentSlug,
    isPublic,
    isLoggedIn,
    rotateLandscape,
    onSetPublic,
    onUpdateSlug,
  }: Props = $props();

  let isExporting = $state(false);
  let publishing = $state(false);
  let copied = $state(false);

  // 編集中(editSlug)と確定済み(savedSlug)を分け、URLは確定値から作る。
  let savedSlug = $state('');
  let editSlug = $state('');
  let slugSaving = $state(false);
  let slugError = $state('');
  let editingSlug = $state(false);

  // デッキが切り替わったら slug 状態を同期。
  $effect(() => {
    const s = currentSlug ?? deckId ?? '';
    savedSlug = s;
    editSlug = s;
    editingSlug = false;
    slugError = '';
  });

  let publicUrl = $derived(
    browser && savedSlug && ownerAtName ? `${location.origin}/@${ownerAtName}/${savedSlug}` : '',
  );

  async function saveSlug() {
    if (slugSaving || editSlug === savedSlug) {
      editingSlug = false;
      return;
    }
    slugSaving = true;
    slugError = '';
    const res = await onUpdateSlug(editSlug);
    if (res.ok) {
      // サーバーで小文字正規化された値を採用（typed の大小と食い違わないように）。
      savedSlug = res.slug ?? editSlug;
      editSlug = savedSlug;
      editingSlug = false;
    } else {
      slugError = res.error ?? '変更できませんでした。';
    }
    slugSaving = false;
  }

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
      setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      /* clipboard 拒否時は無視 */
    }
  }

  // 画像出力オプション（列数・テーマ）。出力時にまとめて渡す。
  let imageCols = $state<8 | 10>(8);
  let imageTheme = $state<DeckImageTheme>('dark');

  const imageOptions = () => ({
    rotateLandscape,
    columns: imageCols,
    theme: imageTheme,
  });

  async function handleExportImage(format: 'png' | 'jpg') {
    if (isExporting || mainDeck.length === 0) return;
    isExporting = true;
    try {
      const canvas = await generateDeckImage(deckName, mainDeck, lrigDeck, imageOptions());
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
      const canvas = await generateDeckImage(deckName, mainDeck, lrigDeck, imageOptions());
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
      <h4 data-suisou-text="s14 w700" class="mb-2">デッキを公開</h4>
      {#if !isLoggedIn}
        <p class="text-gray-400 text-xs">ログインするとデッキを公開・共有できます。</p>
      {:else if !deckId}
        <p class="text-gray-400 text-xs">デッキを保存すると公開・共有できます。</p>
      {:else}
        <!-- 手製スイッチをやめてネイティブ checkbox に（2026-08-21）。
             Suisou はネイティブ部品を奪わない ―― accent-color が根で1回
             書いてあるので、色は勝手にテーマへ追従する。塗りのトグルは
             wixdex に残った最後の「塗る操作部品」だった。 -->
        <label class="flex items-center justify-between text-gray-300 text-sm">
          このデッキを公開する
          <input
            type="checkbox"
            class="h-4 w-4"
            checked={isPublic}
            onchange={togglePublish}
            disabled={publishing}
          />
        </label>
        {#if isPublic}
          {#if publicUrl}
            <div class="flex mt-3" data-suisou-button-group>
              <input
                type="text"
                readonly
                value={publicUrl}
                data-suisou-field
                class="text-xs select-all"
              />
              <button type="button" onclick={copyLink} data-suisou-button class="text-xs shrink-0">
                <IconClipboard size={16} />
                {copied ? 'コピー済' : 'コピー'}
              </button>
            </div>

            {#if editingSlug}
              <div class="mt-2">
                <div class="flex items-center" data-suisou-button-group>
                  <span class="prefix">/@{ownerAtName}/</span>
                  <input
                    type="text"
                    bind:value={editSlug}
                    autocapitalize="none"
                    autocomplete="off"
                    spellcheck="false"
                    data-suisou-field
                    class="text-xs"
                  />
                  <button
                    type="button"
                    onclick={saveSlug}
                    disabled={slugSaving}
                    data-suisou-button="outline"
                    class="text-xs shrink-0"
                  >
                    {slugSaving ? '...' : '保存'}
                  </button>
                </div>
                {#if slugError}
                  <p class="text-red-400 text-xs mt-1">{slugError}</p>
                {/if}
              </div>
            {:else}
              <div class="flex items-center justify-between mt-1">
                <p class="text-gray-500 text-xs">
                  リンクを知っている人がこのデッキを閲覧できます。
                </p>
                <button
                  type="button"
                  onclick={() => (editingSlug = true)}
                  data-suisou-button
                  class="text-xs shrink-0"
                >
                  URLを編集
                </button>
              </div>
            {/if}
          {:else}
            <p class="text-yellow-500 text-xs mt-3">
              共有URLを発行するには
              <a href="/settings" data-suisou-link>設定</a>でユーザー名を決めてください。
            </p>
          {/if}
        {/if}
      {/if}
    </div>

    <!-- 画像エクスポート -->
    <div class="pt-4 border-t border-zinc-700">
      <h4 data-suisou-text="s14 w700" class="mb-3">画像エクスポート</h4>

      <!-- オプション: 列数 / テーマ -->
      <div class="flex gap-3 mb-3">
        <div class="flex flex-1" data-suisou-button-group>
          <button
            type="button"
            data-suisou-button
            class="flex-1 text-sm"
            aria-pressed={imageCols === 8}
            onclick={() => (imageCols = 8)}>8列</button
          >
          <button
            type="button"
            data-suisou-button
            class="flex-1 text-sm"
            aria-pressed={imageCols === 10}
            onclick={() => (imageCols = 10)}>10列</button
          >
        </div>
        <div class="flex flex-1" data-suisou-button-group>
          <button
            type="button"
            data-suisou-button
            class="flex-1 text-sm"
            aria-pressed={imageTheme === 'dark'}
            onclick={() => (imageTheme = 'dark')}
          >
            <IconMoon size={16} /> ダーク
          </button>
          <button
            type="button"
            data-suisou-button
            class="flex-1 text-sm"
            aria-pressed={imageTheme === 'light'}
            onclick={() => (imageTheme = 'light')}
          >
            <IconSun size={16} /> ライト
          </button>
        </div>
      </div>

      <!-- 画像(JPG)。コピーはブラウザ制約によりPNGで書き込まれる(貼り付け互換のため)。 -->
      <div class="flex" data-suisou-button-group>
        <div class="flex flex-1 items-center justify-center text-sm font-medium">ダウンロード</div>
        <button
          type="button"
          data-suisou-button="icon"
          onclick={handleCopyToClipboard}
          disabled={isExporting || mainDeck.length === 0}
          title="クリップボードにコピー"
        >
          <IconClipboard />
        </button>
        <button
          type="button"
          data-suisou-button="icon"
          onclick={() => handleExportImage('jpg')}
          disabled={isExporting || mainDeck.length === 0}
          title="JPGでダウンロード"
        >
          <IconDownload />
        </button>
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

<style>
  /* settings の /@ と同じ扱い。囲いは連結（button-group）が持つので、
     接頭辞は素の文字でいい */
  .prefix {
    padding-left: var(--suisou-space-2);
    color: var(--suisou-text-disabled);
    font-size: var(--suisou-size-12);
    white-space: nowrap;
  }
</style>
