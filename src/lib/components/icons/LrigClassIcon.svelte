<script lang="ts">
  let { filled = false, class: className = 'w-5 h-5' }: { filled?: boolean; class?: string } = $props();
</script>
<svg xmlns="http://www.w3.org/2000/svg" fill={filled ? 'currentColor' : 'none'}
  viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={className}>
  <path stroke-linecap="round" stroke-linejoin="round"
    d="M9.42 4.83 3.046 11.205a1.125 1.125 0 0 0 0 1.59l6.374 6.375c.21.211.497.33.795.33H19.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25h-9.284c-.298 0-.585.119-.795.33Z" />
</svg>
