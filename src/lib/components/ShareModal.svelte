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
  <div data-suisou-layout="stack gap-3">
    <!-- デッキ公開 -->
    <div>
      <h4 data-suisou-text="s14 w700" class="mb-2">デッキを公開</h4>
      {#if !isLoggedIn}
        <p data-suisou-text="sub s12">ログインするとデッキを公開・共有できます。</p>
      {:else if !deckId}
        <p data-suisou-text="sub s12">デッキを保存すると公開・共有できます。</p>
      {:else}
        <!-- 手製スイッチをやめてネイティブ checkbox に（2026-08-21）。
             Suisou はネイティブ部品を奪わない ―― accent-color が根で1回
             書いてあるので、色は勝手にテーマへ追従する。塗りのトグルは
             wixdex に残った最後の「塗る操作部品」だった。 -->
        <label data-suisou-layout="row between" data-suisou-text="sub">
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
            <div class="mt-3" data-suisou-button-group="even">
              <input type="text" readonly value={publicUrl} data-suisou-field class="select-all" data-suisou-text="s12"/>
              <button type="button" onclick={copyLink} data-suisou-button class="shrink-0" data-suisou-text="s12">
                <IconClipboard size={16} />
                {copied ? 'コピー済' : 'コピー'}
              </button>
            </div>

            {#if editingSlug}
              <div class="mt-2">
                <div data-suisou-button-group="even">
                  <span data-suisou-affix data-suisou-text="s12">/@{ownerAtName}/</span>
                  <input type="text" bind:value={editSlug} autocapitalize="none" autocomplete="off" spellcheck="false" data-suisou-field data-suisou-text="s12"/>
                  <button type="button" onclick={saveSlug} disabled={slugSaving} data-suisou-button="outline" class="shrink-0" data-suisou-text="s12">
                    {slugSaving ? '...' : '保存'}
                  </button>
                </div>
                {#if slugError}
                  <p class="mt-1" data-suisou-text="error s12">{slugError}</p>
                {/if}
              </div>
            {:else}
              <div data-suisou-layout="row between" class="mt-1">
                <p data-suisou-text="sub s12">
                  リンクを知っている人がこのデッキを閲覧できます。
                </p>
                <button type="button" onclick={() => (editingSlug = true)} data-suisou-button class="shrink-0" data-suisou-text="s12">
                  URLを編集
                </button>
              </div>
            {/if}
          {:else}
            <p class="mt-3" data-suisou-text="warning s12">
              共有URLを発行するには
              <a href="/settings" data-suisou-link>設定</a>でユーザー名を決めてください。
            </p>
          {/if}
        {/if}
      {/if}
    </div>

    <!-- 画像エクスポート -->
    <div class="pt-4 border-t rule">
      <h4 data-suisou-text="s14 w700" class="mb-2">画像エクスポート</h4>

      <!-- オプション: 列数 / テーマ -->
      <div data-suisou-layout="row" class="mb-4">
        <div data-suisou-button-group="even">
          <button
            type="button"
            data-suisou-button
            aria-pressed={imageCols === 8}
            onclick={() => (imageCols = 8)}>8列</button
          >
          <button
            type="button"
            data-suisou-button
            aria-pressed={imageCols === 10}
            onclick={() => (imageCols = 10)}>10列</button
          >
        </div>
        <div data-suisou-button-group="even">
          <button
            type="button"
            data-suisou-button
            aria-pressed={imageTheme === 'dark'}
            onclick={() => (imageTheme = 'dark')}
          >
            <IconMoon size={16} /> ダーク
          </button>
          <button
            type="button"
            data-suisou-button
            aria-pressed={imageTheme === 'light'}
            onclick={() => (imageTheme = 'light')}
          >
            <IconSun size={16} /> ライト
          </button>
        </div>
      </div>

      <!-- 画像(JPG)。コピーはブラウザ制約によりPNGで書き込まれる(貼り付け互換のため)。 -->
      <div data-suisou-button-group="even">
        <div class="justify-center" data-suisou-text="w500" data-suisou-layout="row grow">ダウンロード</div>
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
        <p class="mt-3" data-suisou-text="warning s12">※デッキにカードを追加してください</p>
      {/if}
      {#if isExporting}
        <p class="mt-3" data-suisou-text="sub s12">生成中...</p>
      {/if}
    </div>

    <div class="pt-4 border-t rule">
      <p data-suisou-text="sub s12">リスト式、テキストエクスポートは今後実装予定です。</p>
    </div>
  </div>
</BaseModal>

<style>
  /* 上の区切り。旧実装は item の色を線に使っていた */
  .rule {
    border-color: var(--suisou-line-weak);
  }
</style>
