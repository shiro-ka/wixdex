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
  <circle cx="12" cy="12" r="10" />
  <circle cx="12" cy="12" r="4" />
  <line x1="12" y1="2" x2="12" y2="8" />
  <line x1="14" y1="15" x2="16" y2="19" />
  <line x1="10" y1="15" x2="8" y2="19" />
</svg>
