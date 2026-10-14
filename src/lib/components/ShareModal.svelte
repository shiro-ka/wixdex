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
      <h4 data-suisou-text="fs-14 fw-700" class="sec-head">デッキを公開</h4>
      {#if !isLoggedIn}
        <p data-suisou-text="fs-12" data-suisou="sub">ログインするとデッキを公開・共有できます。</p>
      {:else if !deckId}
        <p data-suisou-text="fs-12" data-suisou="sub">デッキを保存すると公開・共有できます。</p>
      {:else}
        <!-- ネイティブの checkbox。Suisou はネイティブ部品を奪わない ――
             accent-color が根で1回書いてあるので、色はテーマに追従する。 -->
        <label data-suisou-layout="row between" data-suisou="sub">
          このデッキを公開する
          <input
            type="checkbox"
            checked={isPublic}
            onchange={togglePublish}
            disabled={publishing}
          />
        </label>
        {#if isPublic}
          {#if publicUrl}
            <div class="sec" data-suisou-item="field">
              <input type="text" readonly value={publicUrl} data-suisou-text="fs-12" class="pick-all"/>
              <button type="button" onclick={copyLink} data-suisou-button data-suisou-text="fs-12" class="fix">
                <IconClipboard size={16} />
                {copied ? 'コピー済' : 'コピー'}
              </button>
            </div>

            {#if editingSlug}
              <div class="sec-sm">
                <div data-suisou-item="field">
                  <span data-suisou-text="fs-12">/@{ownerAtName}/</span>
                  <input type="text" bind:value={editSlug} autocapitalize="none" autocomplete="off" spellcheck="false" data-suisou-text="fs-12"/>
                  <button type="button" onclick={saveSlug} disabled={slugSaving} data-suisou-button="outline" data-suisou-text="fs-12" data-suisou="accent" class="fix">
                    {slugSaving ? '...' : '保存'}
                  </button>
                </div>
                {#if slugError}
                  <p class="sec-xs" data-suisou-text="fs-12" data-suisou="error">{slugError}</p>
                {/if}
              </div>
            {:else}
              <div data-suisou-layout="row between" class="sec-xs">
                <p data-suisou-text="fs-12" data-suisou="sub">
                  リンクを知っている人がこのデッキを閲覧できます。
                </p>
                <button type="button" onclick={() => (editingSlug = true)} data-suisou-button data-suisou-text="fs-12" class="fix">
                  URLを編集
                </button>
              </div>
            {/if}
          {:else}
            <p class="sec" data-suisou-text="fs-12" data-suisou="warning">
              共有URLを発行するには
              <a href="/settings" data-suisou-text="link">設定</a>でユーザー名を決めてください。
            </p>
          {/if}
        {/if}
      {/if}
    </div>

    <!-- 画像エクスポート -->
    <div data-suisou="bd-top" class="sec-block">
      <h4 data-suisou-text="fs-14 fw-700" class="sec-head">画像エクスポート</h4>

      <!-- オプション: 列数 / テーマ -->
      <div data-suisou-layout="row" class="row-gap">
        <div data-suisou-tray data-suisou-layout="row gap-0">
          <button
            type="button"
            data-suisou-button
            data-suisou-layout="grow"
            aria-pressed={imageCols === 8}
            onclick={() => (imageCols = 8)}>8列</button
          >
          <button
            type="button"
            data-suisou-button
            data-suisou-layout="grow"
            aria-pressed={imageCols === 10}
            onclick={() => (imageCols = 10)}>10列</button
          >
        </div>
        <div data-suisou-tray data-suisou-layout="row gap-0">
          <button
            type="button"
            data-suisou-button
            data-suisou-layout="grow"
            aria-pressed={imageTheme === 'dark'}
            onclick={() => (imageTheme = 'dark')}
          >
            <IconMoon size={16} /> ダーク
          </button>
          <button
            type="button"
            data-suisou-button
            data-suisou-layout="grow"
            aria-pressed={imageTheme === 'light'}
            onclick={() => (imageTheme = 'light')}
          >
            <IconSun size={16} /> ライト
          </button>
        </div>
      </div>

      <!-- 画像(JPG)。コピーはブラウザ制約によりPNGで書き込まれる(貼り付け互換のため)。 -->
      <div data-suisou-tray data-suisou-layout="row gap-0">
        <div data-suisou-layout="row grow middle" data-suisou-text="fw-500">ダウンロード</div>
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
        <p class="sec" data-suisou-text="fs-12" data-suisou="warning">※デッキにカードを追加してください</p>
      {/if}
      {#if isExporting}
        <p class="sec" data-suisou-text="fs-12" data-suisou="sub">生成中...</p>
      {/if}
    </div>

    <div data-suisou="bd-top" class="sec-block">
      <p data-suisou-text="fs-12" data-suisou="sub">リスト式、テキストエクスポートは今後実装予定です。</p>
    </div>
  </div>
</BaseModal>

<style>
  /* 12px は Suisou の段（4/8/16/24）に無いので px で書く。 */

  .sec {
    margin-block-start: 12px;
  }
  .sec-sm {
    margin-block-start: var(--suisou-space-2);
  }
  .sec-xs {
    margin-block-start: var(--suisou-space-1);
  }
  .sec-head {
    margin-block-end: var(--suisou-space-2);
  }
  .sec-block {
    padding-block-start: var(--suisou-space-3);
  }
  .row-gap {
    margin-block-end: var(--suisou-space-3);
  }
  .fix {
    flex: none;
  }
  .pick-all {
    user-select: all;
  }

  /* 上の区切り */
</style>
