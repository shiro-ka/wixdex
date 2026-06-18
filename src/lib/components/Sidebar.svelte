<script lang="ts">
  import IconX from '@tabler/icons-svelte/icons/x';
  import IconLibraryPlus from '@tabler/icons-svelte/icons/library-plus';
  import IconLibrary from '@tabler/icons-svelte/icons/library';
  import IconChartLine from '@tabler/icons-svelte/icons/chart-line';
  import IconUser from '@tabler/icons-svelte/icons/user';
  import { IconLink } from '@tabler/icons-svelte/IconLink.svelte';
  import IconBrandBluesky from '@tabler/icons-svelte/icons/brand-bluesky';
  import IconBrandGithub from '@tabler/icons-svelte/icons/brand-github';
  import { sidebarBtn } from '$lib/styles';
  import clsx from 'clsx';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onDeckListClick: () => void;
    onNewDeckClick: () => void;
    onStatsClick: () => void;
    user?: { displayName: string } | null;
  }

  let { isOpen, onClose, onDeckListClick, onNewDeckClick, onStatsClick, user = null }: Props = $props();

  const isLoggedIn = $derived(!!user);

  let isAnimating = $state(false);
  let shouldRender = $state(false);
  let timer: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (isOpen) {
      shouldRender = true;
      clearTimeout(timer);
      setTimeout(() => { isAnimating = true; }, 10);
    } else {
      isAnimating = false;
      timer = setTimeout(() => { shouldRender = false; }, 300);
    }
    return () => clearTimeout(timer);
  });
</script>

{#if shouldRender}
  <button
    class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 cursor-default {isAnimating ? 'opacity-100' : 'opacity-0'}"
    onclick={onClose} aria-label="閉じる"
  ></button>

  <div class="fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-neutral-700 z-50 shadow-xl p-4 transition-transform duration-300 ease-out flex flex-col {isAnimating ? 'translate-x-0' : 'translate-x-full'}">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white">Menu</h2>
      <button onclick={onClose}
        class="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg p-1 transition-all"
        aria-label="閉じる">
        <IconX class="w-6 h-6" />
      </button>
    </div>

    <div class="space-y-2">
      <p>Deck</p>
      <button
        onclick={isLoggedIn ? () => { onNewDeckClick(); onClose(); } : undefined}
        disabled={!isLoggedIn}
        class={sidebarBtn({ disabled: !isLoggedIn })}
      >
        <IconLibraryPlus class="w-5 h-5" />
        <span>新しいデッキを作成</span>
      </button>
      <button
        onclick={isLoggedIn ? () => { onDeckListClick(); onClose(); } : undefined}
        disabled={!isLoggedIn}
        class={sidebarBtn({ disabled: !isLoggedIn })}
      >
        <IconLibrary class="w-5 h-5" />
        <span>デッキ一覧</span>
      </button>
      <button
        onclick={() => { onStatsClick(); onClose(); }}
        class="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-gray-100 transition-colors">
        <IconChartLine class="w-5 h-5" />
        <span>カード使用統計</span>
      </button>
    </div>

    <div class="mt-4 pt-4 border-t border-neutral-700">
      <p>Account</p>
      {#if user}
        <div class="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
          <IconUser size={20} class="shrink-0" />
          <span class="truncate">{user.displayName}</span>
        </div>
        <a href="/account" onclick={onClose} class={sidebarBtn({ variant: 'action' })}>
          アカウント設定
        </a>
        <form method="POST" action="/api/auth/logout">
          <button type="submit" onclick={onClose} class={clsx(sidebarBtn({ variant: 'muted' }), 'mt-2')}>
            ログアウト
          </button>
        </form>
      {:else}
        <a href="/login" onclick={onClose}
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-white font-medium text-sm">
          ログイン / 登録
        </a>
      {/if}
    </div>

    <div class="mt-auto gap-8 py-4 border-t border-neutral-700">
      <p class=""><IconLink stroke={2} /> Link</p>
      <div class="flex">
        <a href="https://bsky.app/profile/wixdex.cards" target="_blank" rel="noopener noreferrer"
          class="text-neutral-100 hover:text-orange-400 transition-colors" title="Bluesky">
          <IconBrandBluesky class="w-6 h-6" />
        </a>
        <div>
          <p>Mado (準備中)</p>
          <p>バグ報告・要望など</p>
        </div>
      </div>
      <div class="flex">
        <a href="https://bsky.app/profile/wixdex.cards" target="_blank" rel="noopener noreferrer"
          class="text-neutral-100 hover:text-orange-400 transition-colors" title="Bluesky">
          <IconBrandBluesky class="w-6 h-6" />
        </a>
        <div>
          <p>Bluesky</p>
          <p>bot稼働中...</p>
        </div>
      </div>
      <div class="flex">
        <a href="https://github.com/shiro-ka/wixdex" target="_blank" rel="noopener noreferrer"
          class="text-neutral-100 hover:text-orange-400 transition-colors" title="GitHub">
          <IconBrandGithub class="w-6 h-6" />
        </a>
        <div>
          <p>GitHub</p>
          <p>スパゲッティコード公開中</p>
        </div>
      </div>
    </div>

  </div>
{/if}
