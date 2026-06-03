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
  let imgEl: HTMLImageElement;

  onMount(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          isInView = true;
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '100px' });

    observer.observe(imgEl);
    return () => observer.disconnect();
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<img
  bind:this={imgEl}
  src={isInView ? src : undefined}
  {alt}
  class="{className} transition-opacity duration-300 {isLoaded ? 'opacity-100' : 'opacity-0'}"
  onload={() => { isLoaded = true; onLoadCallback?.(true); }}
  {onmouseenter} {onmouseleave} {onclick} {onwheel}
  {ontouchstart} {ontouchmove} {ontouchend}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
  onkeydown={onclick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onclick(); } : undefined}
/>
