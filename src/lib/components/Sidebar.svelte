<script lang="ts">
  import IconX from '@tabler/icons-svelte/icons/x';
  import IconLibraryPlus from '@tabler/icons-svelte/icons/library-plus';
  import IconLibrary from '@tabler/icons-svelte/icons/library';
  import IconChartLine from '@tabler/icons-svelte/icons/chart-line';
  import IconUser from '@tabler/icons-svelte/icons/user';
  import IconBrandBluesky from '@tabler/icons-svelte/icons/brand-bluesky';
  import IconBrandGithub from '@tabler/icons-svelte/icons/brand-github';
  import IconMado from '$lib/components/icons/IconMado.svelte';
  import { logout } from '$lib/utils/logout';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onDeckListClick?: () => void;
    onNewDeckClick?: () => void;
    onStatsClick?: () => void;
    // ツール(トップ)以外のページではデッキ操作系メニューを出さない
    showDeckTools?: boolean;
    user?: {
      displayName: string;
      username: string | null;
      blueskyHandle: string | null;
    } | null;
  }

  let {
    isOpen,
    onClose,
    onDeckListClick,
    onNewDeckClick,
    onStatsClick,
    showDeckTools = true,
    user = null,
  }: Props = $props();

  const isLoggedIn = $derived(!!user);
  // マイページのURLキー: メアド勢=username / bsky勢=ハンドル。未設定なら非表示。
  const myAtName = $derived(user ? (user.username ?? user.blueskyHandle) : null);

  // 開閉はネイティブ popover に任せる。滑りの出入り・ESC・外側クリック・膜は
  // ブラウザと Suisou の drawer が持つ。以前ここにあったタイマー式の状態機械は
  // そのために存在していたので、丸ごと消えた。
  let el = $state<HTMLDivElement>();

  $effect(() => {
    if (!el) return;
    const opened = el.matches(':popover-open');
    if (isOpen && !opened) el.showPopover();
    else if (!isOpen && opened) el.hidePopover();
  });
</script>

<!-- セクション見出し（Deck / Account / Link で共通） -->
{#snippet sectionLabel(text: string)}
  <p data-suisou-text="fs-12 fw-700" class="label">{text}</p>
{/snippet}

<!-- 外部リンク1行（アイコン + タイトル + 説明）。Row が下地の反応、Media が並び -->
{#snippet linkRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any,
  title: string,
  desc: string,
  href: string,
)}
  <a {href} target="_blank" rel="noopener noreferrer" data-suisou-row data-suisou-item="media">
    <span data-suisou-item="media-figure"><Icon /></span>
    <div data-suisou-item="media-content">
      <p data-suisou-text="fs-14 fw-500">{title}</p>
      <p data-suisou-text="fs-12" class="desc">{desc}</p>
    </div>
  </a>
{/snippet}

<div
  bind:this={el}
  popover="auto"
  data-suisou-tray="drawer right"
  data-suisou-layout="stack"
  ontoggle={(e) => {
    // ESC・外側クリックで閉じたときに親の状態を追従させる
    if (e.newState === 'closed' && isOpen) onClose();
  }}
>
  <div data-suisou-layout="row end">
    <button data-suisou-button="icon" onclick={onClose} aria-label="閉じる">
      <IconX />
    </button>
  </div>

  {#if showDeckTools}
    <div data-suisou-layout="stack">
      {@render sectionLabel('Menu')}
      <button
        data-suisou-button="block"
        onclick={isLoggedIn
          ? () => {
              onNewDeckClick?.();
              onClose();
            }
          : undefined}
        disabled={!isLoggedIn}
      >
        <IconLibraryPlus />
        <span>新しいデッキを作成</span>
      </button>
      <button
        data-suisou-button="block"
        onclick={isLoggedIn
          ? () => {
              onDeckListClick?.();
              onClose();
            }
          : undefined}
        disabled={!isLoggedIn}
      >
        <IconLibrary />
        <span>デッキ一覧</span>
      </button>
      <button
        data-suisou-button="block"
        onclick={() => {
          onStatsClick?.();
          onClose();
        }}
      >
        <IconChartLine />
        <span>カード使用統計</span>
      </button>
    </div>
  {/if}

  <div data-suisou-layout="stack" class="section account">
    {@render sectionLabel('Account')}
    {#if user}
      <div data-suisou-item="media" class="static-row">
        <span data-suisou-item="media-figure"><IconUser size={20} /></span>
        <span data-suisou-text="one-line">{user.displayName}</span>
      </div>
      {#if myAtName}
        <a href="/@{myAtName}" onclick={onClose} data-suisou-button="block">マイページ</a>
      {/if}
      <a href="/settings" onclick={onClose} data-suisou-button="block">設定</a>
      <button
        type="button"
        data-suisou-button="block"
        onclick={() => {
          onClose();
          logout();
        }}
      >
        ログアウト
      </button>
    {:else}
      <a href="/login" onclick={onClose} data-suisou-button="outline" data-suisou="accent" class="login">
        ログイン / 登録
      </a>
    {/if}
  </div>

  <div data-suisou-layout="stack" class="section">
    {@render sectionLabel('Link')}

    {@render linkRow(
      IconMado,
      'Mado',
      'バグ報告・要望など',
      'https://mado.blue/@ffffffflower.bsky.social/wixdex',
    )}
    {@render linkRow(
      IconBrandBluesky,
      'Bluesky',
      'bot稼働中...',
      'https://bsky.app/profile/wixdex.cards',
    )}
    {@render linkRow(
      IconBrandGithub,
      'GitHub',
      'apkリリースもあります',
      'https://github.com/shiro-ka/wixdex',
    )}
  </div>
</div>

<style>
  /* ドロワー固有の仕事は Suisou の drawer（surface）と popover に移った。
     残っているのは中身の整えだけ。色と寸法は var(--suisou-*) 参照のみ。 */

  .label {
    margin: 0;
    padding-inline: var(--suisou-space-3);
    color: var(--suisou-color-text-disabled);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* セクションの間は項目の間より広く。Account は下に押し付ける */
  .section {
    margin-top: var(--suisou-space-3);
  }
  .account {
    margin-top: auto;
  }

  /* 押せない行。Row（hover する行）と同じ余白だけ借りる */
  /* 押せない行。block ボタン（縦8/横16）と左端・行送りを揃える */
  .static-row {
    padding: var(--suisou-space-2) var(--suisou-space-3);
    color: var(--suisou-color-text-sub);
  }

  .desc {
    color: var(--suisou-color-text-disabled);
  }


  .login {
    width: 100%;
  }
</style>
