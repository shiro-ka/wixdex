<script lang="ts">
  import IconSquare from '@tabler/icons-svelte/icons/square';
  import IconSquareCheckFilled from '@tabler/icons-svelte/icons/square-check-filled';

  let { checked = false, class: className = '',
    ...restProps
  }: { checked?: boolean; class?: string;
    [key: string]: unknown;
  } = $props();
</script>

{#if checked}
  <IconSquareCheckFilled class={className} {...restProps} />
{:else}
  <IconSquare class={className} {...restProps} />
{/if}
