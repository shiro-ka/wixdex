<script lang="ts">
  import LazyImage from './LazyImage.svelte';
  import LifeBurstIcon from './icons/LifeBurstIcon.svelte';
  import type { Card } from '$lib/types';

  interface Props {
    card: Card;
    src: string;
    alt: string;
    class?: string;
    showLifeBurst?: boolean;
    showCandidateIcon?: boolean;
    isInCandidates?: boolean;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onclick?: () => void;
    onwheel?: (e: WheelEvent) => void;
    ontouchstart?: (e: TouchEvent) => void;
    ontouchmove?: (e: TouchEvent) => void;
    ontouchend?: (e: TouchEvent) => void;
  }

  let {
    card, src, alt,
    class: className = '',
    showLifeBurst = false,
    showCandidateIcon = false,
    isInCandidates = false,
    onmouseenter, onmouseleave, onclick, onwheel,
    ontouchstart, ontouchmove, ontouchend,
  }: Props = $props();

  let isImageLoaded = $state(false);
  const hasLifeBurst = $derived(card.lifeBurst === 'true');
</script>

<div class="relative inline-block">
  <LazyImage
    {src} {alt} class={className}
    {onmouseenter} {onmouseleave} {onclick} {onwheel}
    {ontouchstart} {ontouchmove} {ontouchend}
    onload={(v) => { isImageLoaded = v; }}
  />
  {#if showLifeBurst && hasLifeBurst && isImageLoaded}
    <div class="absolute bottom-1 right-1 bg-orange-500 rounded-full p-0.5 shadow-lg">
      <LifeBurstIcon class="w-3 h-3 text-white" />
    </div>
  {/if}
  {#if showCandidateIcon && isInCandidates && isImageLoaded}
    <div class="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5 shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 text-white">
        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
      </svg>
    </div>
  {/if}
</div>
