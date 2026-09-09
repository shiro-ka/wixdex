<script lang="ts">
  /* ★class の既定値に Tailwind の 'w-5 h-5' が入っていた（2026-09-09 に外した）。
     寸法は data-suisou-icon が持つ ―― 呼ぶ側が属性を書いているのに、
     既定値のほうが後から効いて上書きしていた。
     ★これは class="…" の棚卸しに引っかからない場所。**既定値も数えろ。** */
  let { filled = false, class: className = '',
    ...restProps
  }: { filled?: boolean; class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<svg
  {...restProps}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="24"
  height="24"
  fill={filled ? 'currentColor' : 'none'}
  stroke={filled ? 'none' : 'currentColor'}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
>
  <path
    d="M5 5 L19 5 A2 2 0 0 1 20.21 6.84 L15.79 17.16 A2 2 0 0 1 13 19 L5 19 A2 2 0 0 1 3 17 L3 7 A2 2 0 0 1 5 5 Z"
  />
</svg>
