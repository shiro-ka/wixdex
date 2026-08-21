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

  let isAnimating = $state(false);
  let shouldRender = $state(false);
  let timer: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (isOpen) {
      shouldRender = true;
      clearTimeout(timer);
      // timer に保持しないと、10ms 以内に閉じられた時にこの遅延発火を cleanup で
      // 止められず isAnimating が固まる。開き側のタイマーも timer で管理する。
      timer = setTimeout(() => {
        isAnimating = true;
      }, 10);
    } else {
      isAnimating = false;
      // 200 は --suisou-motion と同じ値。トランジションが終わってから DOM を外す
      timer = setTimeout(() => {
        shouldRender = false;
      }, 200);
    }
    return () => clearTimeout(timer);
  });
</script>

<!-- セクション見出し（Deck / Account / Link で共通） -->
{#snippet sectionLabel(text: string)}
  <p data-suisou-text="s12 w700" class="label">{text}</p>
{/snippet}

<!-- 外部リンク1行（アイコン + タイトル + 説明）。Row が下地の反応、Media が並び -->
{#snippet linkRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any,
  title: string,
  desc: string,
  href: string,
)}
  <a {href} target="_blank" rel="noopener noreferrer" data-suisou-row data-suisou-media>
    <span data-suisou-media-icon><Icon /></span>
    <div data-suisou-media-content>
      <p data-suisou-text="s14 w500">{title}</p>
      <p data-suisou-text="s12" class="desc">{desc}</p>
    </div>
  </a>
{/snippet}

{#if shouldRender}
  <button class="scrim" class:open={isAnimating} onclick={onClose} aria-label="閉じる"></button>

  <div class="drawer" class:open={isAnimating} data-suisou-layout="stack">
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
        <div data-suisou-media class="static-row">
          <span data-suisou-media-icon><IconUser size={20} /></span>
          <span class="one-line">{user.displayName}</span>
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
        <a href="/login" onclick={onClose} data-suisou-button="outline" class="login">
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
{/if}

<style>
  /* ドロワー固有の仕事だけがここにある: 位置・重なり・出入り・省略記法。
     色と寸法は値を書かず var(--suisou-*) だけを参照する。 */

  .scrim {
    position: fixed;
    inset: 0;
    z-index: 40;
    border: 0;
    padding: 0;
    background: var(--suisou-scrim);
    cursor: default;
    opacity: 0;
    transition: opacity var(--suisou-motion) var(--suisou-ease);
  }
  .scrim.open {
    opacity: 1;
  }

  /* 浮くものなので面は overlay、縁は line-strong（Suisou の面の約束） */
  .drawer {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 50;
    height: 100%;
    width: 20rem;
    background: var(--suisou-overlay);
    border-left: 1px solid var(--suisou-line-strong);
    padding: var(--suisou-space-3);
    transform: translateX(100%);
    transition: transform var(--suisou-motion) var(--suisou-ease);
  }
  .drawer.open {
    transform: translateX(0);
  }

  .label {
    margin: 0;
    padding-inline: var(--suisou-space-2);
    color: var(--suisou-text-disabled);
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
  .static-row {
    padding: var(--suisou-space-1) var(--suisou-space-2);
    color: var(--suisou-text-sub);
  }

  .desc {
    color: var(--suisou-text-disabled);
  }

  .one-line {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .login {
    width: 100%;
  }
</style>
