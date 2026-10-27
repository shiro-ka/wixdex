<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import IconMenu2 from '@tabler/icons-svelte/icons/menu-2';
  import Sidebar from './Sidebar.svelte';

  let { right }: { right?: Snippet } = $props();

  let isSidebarOpen = $state(false);
</script>

<header class="bar">
  <a href="/" class="brand" data-suisou-layout="row">
    <img src="/wixdex.png" alt="wixdex" class="logo" />
    <span data-suisou-text="fs-16 fw-700">wixdex</span>
  </a>
  <div data-suisou-layout="row">
    {#if right}
      {@render right()}
    {:else}
      <a href="/" data-suisou-button="outline" data-suisou="accent">デッキを作る</a>
    {/if}
    <button
      data-suisou-button="icon"
      type="button"
      onclick={() => (isSidebarOpen = true)}
      aria-label="メニュー"
    >
      <IconMenu2 />
    </button>
  </div>
</header>

<Sidebar
  isOpen={isSidebarOpen}
  onClose={() => (isSidebarOpen = false)}
  user={page.data.user}
  showDeckTools={false}
/>

<style>
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--suisou-space-2) var(--suisou-space-3);
  }
  .logo {
    height: 1.75rem;
  }
  .brand {
    transition: opacity var(--suisou-duration-fast) var(--suisou-ease);
  }
  .brand:hover {
    opacity: 0.8;
  }
</style>
