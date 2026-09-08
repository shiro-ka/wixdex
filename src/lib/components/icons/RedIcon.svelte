<script lang="ts">
  let { class: className = 'w-5 h-5',
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
