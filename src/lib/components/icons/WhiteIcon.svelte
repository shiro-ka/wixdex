<script lang="ts">
  let { class: className = 'w-5 h-5' }: { class?: string } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
>
  <path d="M12 2 L21 7 L19 18 L12 22 L5 18 L3 7 Z" />
  <line x1="17" y1="5" x2="16" y2="20" />
  <line x1="7" y1="5" x2="8" y2="20" />
</svg>
