<script lang="ts">
  type Mode = 'default' | 'add' | 'remove' | 'filled';
  let { mode = 'default', class: className = 'w-5 h-5' }: { mode?: Mode; class?: string } = $props();
</script>

{#if mode === 'filled'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 3a1 1 0 0 1 .608 .206l.1 .087l2.706 2.707h6.586a3 3 0 0 1 2.995 2.824l.005 .176v8a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-11a3 3 0 0 1 2.824 -2.995l.176 -.005h4z" />
  </svg>
{:else if mode === 'add'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v3.5" />
    <path d="M16 19h6" />
    <path d="M19 16v6" />
  </svg>
{:else if mode === 'remove'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M13.5 19h-8.5a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v4" />
    <path d="M22 22l-5 -5" />
    <path d="M17 22l5 -5" />
  </svg>
{:else}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
  </svg>
{/if}
