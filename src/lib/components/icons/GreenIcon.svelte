<script lang="ts">
  /* 寸法は呼ぶ側の data-suisou-icon が持つ。class の既定値を置かないこと。 */
  let { class: className = '',
    ...restProps
  }: { class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<svg
  {...restProps}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
>
  <path d="M12 2 L20 7 L22 22 L2 22 L4 7 Z" />
  <line x1="14.5" y1="4" x2="14.5" y2="22" />
  <line x1="9.5" y1="4" x2="9.5" y2="22" />
</svg>
