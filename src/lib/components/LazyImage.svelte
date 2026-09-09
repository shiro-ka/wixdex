<script module lang="ts">
  // Fade-in should mark a genuine list change (initial load / filter change),
  // not scrolling. `fadeToken` is the filtered `cards` array reference — a new
  // one means the list changed. On change we open a short window: cards that
  // mount within it are the new on-screen batch and fade in; cards revealed
  // later by scrolling fall outside it and just appear. No token (deck / shared
  // views) opts out and keeps the plain fade-on-mount.
  let shownToken: unknown;
  let fadeWindowUntil = 0;

  function shouldFadeIn(token: unknown): boolean {
    if (token === undefined) return true;
    if (token !== shownToken) {
      shownToken = token;
      fadeWindowUntil = performance.now() + 150;
    }
    return performance.now() <= fadeWindowUntil;
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';

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
    onload?: (img: HTMLImageElement) => void;
    /** Identifies the current list generation; a new value re-enables fade-in. */
    fadeToken?: unknown;
    /** Hard opt-out of fade-in (e.g. deck cells, added/removed rapid-fire). */
    fade?: boolean;
  }

  let {
    src,
    alt,
    class: className = '',
    onmouseenter,
    onmouseleave,
    onclick,
    onwheel,
    ontouchstart,
    ontouchmove,
    ontouchend,
    onload: onLoadCallback,
    fadeToken,
    fade: fadeEnabled = true,
  }: Props = $props();

  // Decided once per mount. Fade only if this mount lands inside a fade window
  // (just after the list changed); scroll-revealed cards land outside it.
  const fade = untrack(() => fadeEnabled && shouldFadeIn(fadeToken));

  let isLoaded = $state(false);
</script>

<!-- The image loads on mount. The card list is virtualized, so only cells near
     the viewport are mounted (the grid's overscan acts as the preload buffer) —
     no separate IntersectionObserver, which couldn't see past the inner scroll
     container's clip anyway. Non-virtualized callers (deck) mount a small set. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<img
  {src}
  {alt}
  decoding="async"
  class="{className} lazy"
  class:fade
  class:shown={isLoaded}
  onload={(e) => {
    isLoaded = true;
    onLoadCallback?.(e.currentTarget as HTMLImageElement);
  }}
  {onmouseenter}
  {onmouseleave}
  {onclick}
  {onwheel}
  {ontouchstart}
  {ontouchmove}
  {ontouchend}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
  onkeydown={onclick
    ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') onclick();
      }
    : undefined}
/>

<style>
  /* 読み込みが終わるまで隠す。透ける度合いは class={式} で切り替える。 */
  .lazy {
    opacity: 0;
  }
  .lazy.shown {
    opacity: 1;
  }
  .lazy.fade {
    transition: opacity 300ms var(--suisou-ease);
  }
</style>
