<script lang="ts">
  /* ★class の既定値に Tailwind の 'w-5 h-5' が入っていた（2026-09-09 に外した）。
     寸法は data-suisou-icon が持つ ―― 呼ぶ側が属性を書いているのに、
     既定値のほうが後から効いて上書きしていた。
     ★これは class="…" の棚卸しに引っかからない場所。**既定値も数えろ。** */
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
  <path d="M12 2 L16 10 L22 9 L12 22 L2 9 L8 10 Z" />
  <line x1="12" y1="2" x2="12" y2="22" />
</svg>
