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
  import { onMount } from 'svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onDeckListClick?: () => void;
    onNewDeckClick?: () => void;
    onStatsClick?: () => void;
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

  let themeLabel = $state('');
  onMount(() => {
    themeLabel = (document.documentElement.dataset.suisouTheme ?? '').split(' ').join(' x ');
  });

  const isLoggedIn = $derived(!!user);
  const myAtName = $derived(user ? (user.username ?? user.blueskyHandle) : null);

  let el = $state<HTMLDivElement>();

  $effect(() => {
    if (!el) return;
    const opened = el.matches(':popover-open');
    if (isOpen && !opened) el.showPopover();
    else if (!isOpen && opened) el.hidePopover();
  });
</script>

{#snippet sectionLabel(text: string)}
  <p data-suisou-text="fs-12 fw-700" class="label">{text}</p>
{/snippet}

{#snippet linkRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any,
  title: string,
  desc: string,
  href: string,
)}
  <a {href} target="_blank" rel="noopener noreferrer" data-suisou-button="block" data-suisou-item="media">
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
  <footer data-suisou-layout="stack center gap-0" data-suisou-text="fs-12 center" data-suisou="sub" class="section">
    <a href="https://suisou.pages.dev" target="_blank" rel="noopener noreferrer" data-suisou-text="link">suisou</a>
    <span>{themeLabel}</span>
  </footer>
</div>

<style>
  .label {
    margin: 0;
    padding-inline: var(--suisou-space-3);
    color: var(--suisou-color-text-disabled);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .section {
    margin-top: var(--suisou-space-3);
  }
  .account {
    margin-top: auto;
  }

  .static-row {
    padding: var(--suisou-space-2) var(--suisou-space-3);
    color: var(--suisou-color-text-sub);
  }

  .desc {
    color: var(--suisou-color-text-disabled);
  }

  .login {
    margin-inline: var(--suisou-space-3);
  }
</style>
