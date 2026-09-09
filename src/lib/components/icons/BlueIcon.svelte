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
  <circle cx="12" cy="12" r="10" />
  <circle cx="12" cy="12" r="4" />
  <line x1="12" y1="2" x2="12" y2="8" />
  <line x1="14" y1="15" x2="16" y2="19" />
  <line x1="10" y1="15" x2="8" y2="19" />
</svg>
