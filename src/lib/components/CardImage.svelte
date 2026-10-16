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
    rotateLandscape?: boolean;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onclick?: () => void;
    onwheel?: (e: WheelEvent) => void;
    ontouchstart?: (e: TouchEvent) => void;
    ontouchmove?: (e: TouchEvent) => void;
    ontouchend?: (e: TouchEvent) => void;
    fadeToken?: unknown;
    fade?: boolean;
  }

  let {
    card,
    src,
    alt,
    class: className = '',
    showLifeBurst = false,
    showCandidateIcon = false,
    isInCandidates = false,
    rotateLandscape = false,
    onmouseenter,
    onmouseleave,
    onclick,
    onwheel,
    ontouchstart,
    ontouchmove,
    ontouchend,
    fadeToken,
    fade = true,
  }: Props = $props();

  let isImageLoaded = $state(false);
  let isLandscape = $state(false);
  const hasLifeBurst = $derived(card.lifeBurst === true);
  const rotated = $derived(rotateLandscape && isLandscape);
</script>

<div
  class="frame"
  class:rotated
>
  <LazyImage
    {src}
    {alt}
    {fadeToken}
    {fade}
    class={rotated ? 'card-rot' : className}
    {onmouseenter}
    {onmouseleave}
    {onclick}
    {onwheel}
    {ontouchstart}
    {ontouchmove}
    {ontouchend}
    onload={(img) => {
      isImageLoaded = true;
      isLandscape = img.naturalWidth > img.naturalHeight;
    }}
  />
  {#if showLifeBurst && hasLifeBurst && isImageLoaded}
    <div
      class="badge at-bottom"
      data-suisou-layout="row"
      style="background: var(--badge-lifeburst)"
    >
      <LifeBurstIcon data-suisou-text="fs-12" />
    </div>
  {/if}
  {#if showCandidateIcon && isInCandidates && isImageLoaded}
    <div
      class="badge at-top"
      data-suisou-layout="row"
      style="background: var(--badge-candidate)"
    >
      <IconFolderFilled data-suisou-text="fs-12" />
    </div>
  {/if}
</div>

<style>
  .frame.rotated :global(.card-rot) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    width: 100cqh;
    height: 100cqw;
    max-width: none;
    object-fit: contain;
    cursor: pointer;
  }

  .frame {
    position: relative;
    display: block;
    width: 100%;
  }
  .frame.rotated {
    aspect-ratio: 12 / 17;
    overflow: hidden;
    container-type: size;
  }

  .badge {
    position: absolute;
    right: 0.25rem;
    border-radius: var(--suisou-radius-pill);
    padding: 2px;
  }
  .badge.at-bottom {
    bottom: 0.25rem;
  }
  .badge.at-top {
    top: 0.25rem;
  }

  .badge {
    color: #fff;
  }
</style>
