<script module lang="ts">
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
    fadeToken?: unknown;
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

  const fade = untrack(() => fadeEnabled && shouldFadeIn(fadeToken));

  let isLoaded = $state(false);
</script>

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
