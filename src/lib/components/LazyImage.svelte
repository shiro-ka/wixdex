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

  // Fade-in is meant as a cover-up while an image first loads — not a thing to
  // replay every time virtualization re-mounts a card on scroll-back. We record
  // which srcs have already faded in for the current list "generation" (the
  // `fadeToken`, i.e. the filtered `cards` array reference). A new token means
  // the filter changed: clear the record so the fresh list fades once again.
  // No token (deck / shared views) opts out and keeps the plain fade-on-mount.
  let shownToken: unknown;
  const shownSrcs = new Set<string>();

  function shouldFadeIn(src: string, token: unknown): boolean {
    if (token === undefined) return true;
    if (token !== shownToken) {
      shownToken = token;
      shownSrcs.clear();
    }
    if (shownSrcs.has(src)) return false;
    shownSrcs.add(src);
    return true;
  }
</script>

<script lang="ts">
  import { onMount, untrack } from 'svelte';

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
    /** Identifies the current list generation; a new value re-enables fade-in. */
    fadeToken?: unknown;
  }

  let {
    src, alt,
    class: className = '',
    onmouseenter, onmouseleave, onclick, onwheel,
    ontouchstart, ontouchmove, ontouchend,
    onload: onLoadCallback,
    fadeToken,
  }: Props = $props();

  let isLoaded = $state(false);
  let isInView = $state(false);
  let imgEl: HTMLImageElement;

  // Decided once per mount: virtualization re-mounts the component on every
  // scroll-back, so a fresh `false` here means "first time we're showing this
  // src for this list", which is exactly when we want the fade.
  const fade = untrack(() => shouldFadeIn(src, fadeToken));

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
  class="{className} {fade ? 'transition-opacity duration-300' : ''} {isLoaded ? 'opacity-100' : 'opacity-0'}"
  onload={() => { isLoaded = true; onLoadCallback?.(true); }}
  {onmouseenter} {onmouseleave} {onclick} {onwheel}
  {ontouchstart} {ontouchmove} {ontouchend}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
  onkeydown={onclick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onclick(); } : undefined}
/>
