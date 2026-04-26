<script lang="ts">
  import CloseIcon from './icons/CloseIcon.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onDeckListClick: () => void;
    onNewDeckClick: () => void;
    user?: { displayName: string } | null;
  }

  let { isOpen, onClose, onDeckListClick, onNewDeckClick, user = null }: Props = $props();

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
        class="text-gray-400 hover:text-white !bg-transparent hover:bg-gray-700/50 rounded-lg p-1 transition-all"
        aria-label="閉じる">
        <CloseIcon />
      </button>
    </div>

    <div class="space-y-2">
      <button onclick={() => { onNewDeckClick(); onClose(); }}
        class="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M7 3m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
          <path d="M4.012 7.26a2.005 2.005 0 0 0 -1.012 1.737v10c0 1.1 .9 2 2 2h10c.75 0 1.158 -.385 1.5 -1" />
          <path d="M11 10h6" /><path d="M14 7v6" />
        </svg>
        <span>新しいデッキを作成</span>
      </button>
      <button onclick={() => { onDeckListClick(); onClose(); }}
        class="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M7 3m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
          <path d="M4.012 7.26a2.005 2.005 0 0 0 -1.012 1.737v10c0 1.1 .9 2 2 2h10c.75 0 1.158 -.385 1.5 -1" />
          <path d="M11 7h5" /><path d="M11 10h6" /><path d="M11 13h3" />
        </svg>
        <span>デッキ一覧</span>
      </button>
      <a href="/stats" onclick={onClose}
        class="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 3v18h18" /><path d="M7 14l4 -4l4 4l5 -5" />
        </svg>
        <span>カード使用統計</span>
      </a>
    </div>

    <div class="mt-4 pt-4 border-t border-neutral-700">
      {#if user}
        <div class="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span class="truncate">{user.displayName}</span>
        </div>
        <a href="/account" onclick={onClose}
          class="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-white text-sm">
          アカウント設定
        </a>
        <form method="POST" action="/api/auth/logout">
          <button type="submit" onclick={onClose}
            class="w-full flex items-center gap-3 px-4 py-3 mt-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white text-sm">
            ログアウト
          </button>
        </form>
      {:else}
        <a href="/login" onclick={onClose}
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors text-white font-medium text-sm">
          ログイン / 登録
        </a>
        <p class="text-xs text-gray-500 text-center mt-2">ログインするとデッキをクラウドに保存できます</p>
      {/if}
    </div>

    <div class="mt-auto flex items-center justify-center gap-8 py-4 border-t border-neutral-700">
      <a href="https://bsky.app/profile/remepiru.bsky.social" target="_blank" rel="noopener noreferrer"
        class="!text-neutral-100 hover:!text-orange-400 transition-colors" title="Bluesky">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6.335 5.144c-1.654 -1.199 -4.335 -2.127 -4.335 .826c0 .59 .35 4.953 .556 5.661c.713 2.463 3.13 2.75 5.444 2.369c-4.045 .665 -4.889 3.208 -2.667 5.41c1.03 1.018 1.913 1.59 2.667 1.59c2 0 3.134 -2.769 3.5 -3.5c.333 -.667 .5 -1.167 .5 -1.5c0 .333 .167 .833 .5 1.5c.366 .731 1.5 3.5 3.5 3.5c.754 0 1.637 -.571 2.667 -1.59c2.222 -2.203 1.378 -4.746 -2.667 -5.41c2.314 .38 4.73 .094 5.444 -2.369c.206 -.708 .556 -5.072 .556 -5.661c0 -2.953 -2.68 -2.025 -4.335 -.826c-2.293 1.662 -4.76 5.048 -5.665 6.856c-.905 -1.808 -3.372 -5.194 -5.665 -6.856z" />
        </svg>
      </a>
      <a href="https://github.com/shiro-ka/wixdex" target="_blank" rel="noopener noreferrer"
        class="!text-neutral-100 hover:!text-orange-400 transition-colors" title="GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
        </svg>
      </a>
    </div>
  </div>
{/if}
