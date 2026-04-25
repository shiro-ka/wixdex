<script lang="ts">
  let { filled = false, class: className = 'w-5 h-5' }: { filled?: boolean; class?: string } = $props();
</script>
<svg xmlns="http://www.w3.org/2000/svg" fill={filled ? 'currentColor' : 'none'}
  viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={className}>
  <path stroke-linecap="round" stroke-linejoin="round"
    d="M4 19 c0 0.552 0.448 1 1 1 h10.5 L22 5 c0 -0.552 -0.448 -1 -1 -1 H5 c-0.552 0 -1 0.448 -1 1 V19 Z" />
</svg>
