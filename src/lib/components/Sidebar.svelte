<script lang="ts">
  import IconX from '@tabler/icons-svelte/icons/x';
  import IconLibraryPlus from '@tabler/icons-svelte/icons/library-plus';
  import IconLibrary from '@tabler/icons-svelte/icons/library';
  import IconChartLine from '@tabler/icons-svelte/icons/chart-line';
  import IconUser from '@tabler/icons-svelte/icons/user';
  import IconWindow from '@tabler/icons-svelte/icons/window';
  import IconBrandBluesky from '@tabler/icons-svelte/icons/brand-bluesky';
  import IconBrandGithub from '@tabler/icons-svelte/icons/brand-github';
  import { sidebarBtn } from '$lib/styles';
  import { logout } from '$lib/utils/logout';
  import clsx from 'clsx';

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
      timer = setTimeout(() => {
        shouldRender = false;
      }, 300);
    }
    return () => clearTimeout(timer);
  });
</script>

<!-- セクション見出し（Deck / Account / Link で共通） -->
{#snippet sectionLabel(text: string)}
  <p class="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">{text}</p>
{/snippet}

<!-- 外部リンク1行（アイコン + タイトル + 説明） -->
{#snippet linkRow(Icon: typeof IconWindow, title: string, desc: string, href: string)}
  <a
    {href}
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
  >
    <Icon class="w-6 h-6 shrink-0" />
    <div class="min-w-0">
      <p class="text-sm font-medium leading-tight">{title}</p>
      <p class="text-xs text-gray-500 leading-tight">{desc}</p>
    </div>
  </a>
{/snippet}

{#if shouldRender}
  <button
    class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 cursor-default {isAnimating
      ? 'opacity-100'
      : 'opacity-0'}"
    onclick={onClose}
    aria-label="閉じる"
  ></button>

  <div
    class="fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-neutral-700 z-50 shadow-xl p-4 transition-transform duration-300 ease-out flex flex-col {isAnimating
      ? 'translate-x-0'
      : 'translate-x-full'}"
  >
    <div class="flex flex-row-reverse mb-4">
      <button
        onclick={onClose}
        class="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg p-1 transition-all"
        aria-label="閉じる"
      >
        <IconX class="w-6 h-6" />
      </button>
    </div>

    {#if showDeckTools}
      <div class="space-y-1">
        {@render sectionLabel('Menu')}
        <button
          onclick={isLoggedIn
            ? () => {
                onNewDeckClick?.();
                onClose();
              }
            : undefined}
          disabled={!isLoggedIn}
          class={sidebarBtn({ disabled: !isLoggedIn })}
        >
          <IconLibraryPlus class="w-5 h-5" />
          <span>新しいデッキを作成</span>
        </button>
        <button
          onclick={isLoggedIn
            ? () => {
                onDeckListClick?.();
                onClose();
              }
            : undefined}
          disabled={!isLoggedIn}
          class={sidebarBtn({ disabled: !isLoggedIn })}
        >
          <IconLibrary class="w-5 h-5" />
          <span>デッキ一覧</span>
        </button>
        <button
          onclick={() => {
            onStatsClick?.();
            onClose();
          }}
          class="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-gray-100 transition-colors"
        >
          <IconChartLine class="w-5 h-5" />
          <span>カード使用統計</span>
        </button>
      </div>
    {/if}

    <div class="mt-auto space-y-1">
      {@render sectionLabel('Account')}
      {#if user}
        <div class="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
          <IconUser size={20} class="shrink-0" />
          <span class="truncate">{user.displayName}</span>
        </div>
        {#if myAtName}
          <a href="/@{myAtName}" onclick={onClose} class={sidebarBtn({ variant: 'action' })}>
            マイページ
          </a>
        {/if}
        <a href="/settings" onclick={onClose} class={sidebarBtn({ variant: 'action' })}> 設定 </a>
        <button
          type="button"
          onclick={() => {
            onClose();
            logout();
          }}
          class={clsx(sidebarBtn({ variant: 'muted' }), 'mt-2')}
        >
          ログアウト
        </button>
      {:else}
        <a
          href="/login"
          onclick={onClose}
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-white font-medium text-sm"
        >
          ログイン / 登録
        </a>
      {/if}
    </div>

    <div class="mt-6 space-y-1">
      {@render sectionLabel('Link')}

      <!-- Mado: 準備中なので非リンク（ミュート表示） -->
      <div class="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-400 cursor-default">
        <IconWindow class="w-6 h-6 shrink-0" />
        <div class="min-w-0">
          <p class="text-sm font-medium leading-tight flex items-center gap-1.5">
            Mado
            <span class="text-[10px] px-1 py-0.5 rounded bg-zinc-700 text-gray-400">準備中</span>
          </p>
          <p class="text-xs text-gray-500 leading-tight">バグ報告・要望など</p>
        </div>
      </div>

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
