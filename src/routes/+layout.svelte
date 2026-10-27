<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';

  let { children } = $props();

  const webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

  onMount(async () => {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({ immediate: true });
  });
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- vite-pwa 生成の信頼済みタグ -->
  {@html webManifestLink}
</svelte:head>

{@render children()}
