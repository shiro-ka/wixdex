<script module lang="ts">
  // One shared IntersectionObserver for every lazy image, instead of one per
  // image. Filter toggles mount/unmount thousands of images at once, and a
  // per-image observer made that churn far heavier than it needs to be.
  const callbacks = new WeakMap<Element, () => void>();
  let sharedObserver: IntersectionObserver | null = null;

  function getObserver(): IntersectionObserver | null {
    if (typeof IntersectionObserver === 'undefined') return null;
    sharedObserver ??= new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = callbacks.get(entry.target);
        sharedObserver!.unobserve(entry.target);
        callbacks.delete(entry.target);
        cb?.();
      }
    }, { rootMargin: '100px' });
    return sharedObserver;
  }

  function observe(el: Element, cb: () => void) {
    const observer = getObserver();
    if (!observer) { cb(); return; }
    callbacks.set(el, cb);
    observer.observe(el);
  }

  function unobserve(el: Element) {
    callbacks.delete(el);
    sharedObserver?.unobserve(el);
  }
</script>

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
    observe(imgEl, () => { isInView = true; });
    return () => unobserve(imgEl);
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
