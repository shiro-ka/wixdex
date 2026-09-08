<script lang="ts">
  import IconSquare from '@tabler/icons-svelte/icons/square';
  import IconSquareCheckFilled from '@tabler/icons-svelte/icons/square-check-filled';

  let { checked = false, class: className = 'w-5 h-5',
    ...restProps
  }: { checked?: boolean; class?: string;
    [key: string]: unknown;
  } = $props();
</script>

{#if checked}
  <IconSquareCheckFilled class={className} />
{:else}
  <IconSquare class={className} />
{/if}
