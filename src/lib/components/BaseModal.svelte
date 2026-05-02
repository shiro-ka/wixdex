<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: Snippet;
    maxWidth?: 'sm' | 'md' | 'lg';
  }

  import IconX from '@tabler/icons-svelte/icons/x';

  let { isOpen, onClose, title, children, maxWidth = 'md' }: Props = $props();

  const maxWidthClasses: Record<string, string> = {
    sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg',
  };
</script>

{#if isOpen}
  <button class="fixed inset-0 bg-black/50 z-50 cursor-default" onclick={onClose} aria-label="閉じる"></button>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 {maxWidthClasses[maxWidth]} bg-zinc-800 border border-neutral-700 z-50 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white">{title}</h2>
      <button onclick={onClose} class="text-gray-400 hover:text-white transition-colors" aria-label="閉じる">
        <IconX class="w-6 h-6" />
      </button>
    </div>
    {@render children()}
  </div>
{/if}
