<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    src: string;
    alt: string;
    class?: string;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onclick?: () => void;
    onwheel?: (e: WheelEvent) => void;
    ontouchstart?: (e: TouchEvent) => void;
    ontouchmove?: (e: TouchEvent) => void;
    ontouchend?: (e: TouchEvent) => void;
    onload?: (loaded: boolean) => void;
  }

  let {
    src, alt,
    class: className = '',
    onmouseenter, onmouseleave, onclick, onwheel,
    ontouchstart, ontouchmove, ontouchend,
    onload: onLoadCallback,
  }: Props = $props();

  let isLoaded = $state(false);
  let isInView = $state(false);
  let containerEl: HTMLElement = $state() as HTMLElement;

  onMount(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          isInView = true;
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '100px' });

    observer.observe(containerEl);
    return () => observer.disconnect();
  });
</script>

{#if isInView}
  <img
    bind:this={containerEl}
    {src} {alt}
    class="{className} transition-opacity duration-300 {isLoaded ? 'opacity-100' : 'opacity-0'}"
    onload={() => { isLoaded = true; onLoadCallback?.(true); }}
    {onmouseenter} {onmouseleave} {onclick} {onwheel}
    {ontouchstart} {ontouchmove} {ontouchend}
  />
{:else}
  <div bind:this={containerEl} class="{className} bg-gray-700/20 animate-pulse"></div>
{/if}
