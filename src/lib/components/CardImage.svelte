<script lang="ts">
  import LazyImage from './LazyImage.svelte';
  import LifeBurstIcon from './icons/LifeBurstIcon.svelte';
  import IconFolderFilled from '@tabler/icons-svelte/icons/folder-filled';
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
  const hasLifeBurst = $derived(card.lifeBurst === true);
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
      <IconFolderFilled class="w-3 h-3 text-white" />
    </div>
  {/if}
</div>
