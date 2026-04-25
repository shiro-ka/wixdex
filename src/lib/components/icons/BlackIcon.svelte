<script lang="ts">
  let { class: className = 'w-5 h-5' }: { class?: string } = $props();
</script>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" class={className}>
  <path d="M12 2 L16 8 L22 12 L16 16 L12 22 L8 16 L2 12 L8 8 Z" />
  <line x1="12" y1="2" x2="12" y2="22" />
  <line x1="2" y1="12" x2="22" y2="12" />
</svg>
