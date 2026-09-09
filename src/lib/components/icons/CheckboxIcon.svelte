<script lang="ts">
  /* ★class の既定値に Tailwind の 'w-5 h-5' が入っていた（2026-09-09 に外した）。
     寸法は data-suisou-icon が持つ ―― 呼ぶ側が属性を書いているのに、
     既定値のほうが後から効いて上書きしていた。
     ★これは class="…" の棚卸しに引っかからない場所。**既定値も数えろ。** */
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
