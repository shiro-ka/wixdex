<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import IconMenu2 from '@tabler/icons-svelte/icons/menu-2';
  import { navBtn, ctaOutline } from '$lib/styles';
  import Sidebar from './Sidebar.svelte';
  import clsx from 'clsx';

  // サブページ共通のトップバー。ツール(トップ)の Navbar に寄せた見た目にする。
  // ・ロゴ画像 + wixdex 文字（トップはロゴのみ）
  // ・デッキ名/保存/共有 の代わりに「デッキを作る」ボタン（ツールへ遷移）
  // ・ハンバーガーはトップと共通の Sidebar（デッキ操作系メニューは非表示）
  // right スニペットを渡すと「デッキを作る」ボタンを差し替えられる。
  let { right }: { right?: Snippet } = $props();

  let isSidebarOpen = $state(false);
</script>

<header
  class="sticky top-0 z-10 flex-shrink-0 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur"
>
  <div class="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-2">
    <a href="/" class="flex items-center gap-2 transition-opacity hover:opacity-80">
      <img src="/wixdex.png" alt="wixdex" class="h-7" />
      <span class="text-lg font-bold tracking-tight text-white">wixdex</span>
    </a>
    <div class="flex items-center gap-4">
      {#if right}
        {@render right()}
      {:else}
        <a href="/" class={clsx(ctaOutline, 'flex h-10 items-center px-4 text-sm font-medium')}>
          デッキを作る
        </a>
      {/if}
      <button
        class={clsx(navBtn(), 'w-10 h-10 rounded-lg')}
        onclick={() => (isSidebarOpen = true)}
        aria-label="メニュー"
      >
        <IconMenu2 class="w-6 h-6 text-gray-400 group-hover:text-gray-200 transition-colors" />
      </button>
    </div>
  </div>
</header>

<Sidebar
  isOpen={isSidebarOpen}
  onClose={() => (isSidebarOpen = false)}
  user={page.data.user}
  showDeckTools={false}
/>
