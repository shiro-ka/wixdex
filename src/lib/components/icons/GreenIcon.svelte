<script lang="ts">
  let { class: className = 'w-5 h-5' }: { class?: string } = $props();
</script>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" class={className}>
  <path d="M12 2 L20 7 L22 22 L2 22 L4 7 Z" />
  <line x1="14.5" y1="4" x2="14.5" y2="22" />
  <line x1="9.5" y1="4" x2="9.5" y2="22" />
</svg>
