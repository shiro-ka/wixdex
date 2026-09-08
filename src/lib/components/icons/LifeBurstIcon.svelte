<script lang="ts">
  let { class: className = 'w-4 h-4',
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
  <path d="M12 2 L15 7 L22 7 L17 12 L22 17 L15 17 L12 22 L9 17 L2 17 L7 12 L2 7 L9 7 Z" />
  <line x1="8" y1="7" x2="16" y2="17" />
  <line x1="16" y1="7" x2="8" y2="17" />
</svg>
