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
    /** 横向きカードを90度回転して縦長カードと同じ向き・サイズで表示する */
    rotateLandscape?: boolean;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onclick?: () => void;
    onwheel?: (e: WheelEvent) => void;
    ontouchstart?: (e: TouchEvent) => void;
    ontouchmove?: (e: TouchEvent) => void;
    ontouchend?: (e: TouchEvent) => void;
    fadeToken?: unknown;
    /** Hard opt-out of fade-in (deck cells). */
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
  // 横長判定は画像の実寸が分かってから。読み込み前は縦長として扱う。
  let isLandscape = $state(false);
  const hasLifeBurst = $derived(card.lifeBurst === true);
  // 設定がオンで、かつ実際に横長のカードのときだけ回転表示する。
  const rotated = $derived(rotateLandscape && isLandscape);
</script>

<div
  class="relative {rotated
    ? 'block w-full aspect-[12/17] overflow-hidden [container-type:size]'
    : 'inline-block'}"
>
  <LazyImage
    {src}
    {alt}
    {fadeToken}
    {fade}
    class={rotated
      ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 w-[100cqh] h-[100cqw] max-w-none object-contain cursor-pointer'
      : className}
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
      class="absolute bottom-1 right-1 rounded-full p-0.5 badge"
      style="background: var(--badge-lifeburst)"
    >
      <LifeBurstIcon data-suisou-icon="tiny" />
    </div>
  {/if}
  {#if showCandidateIcon && isInCandidates && isImageLoaded}
    <div
      class="absolute top-1 right-1 rounded-full p-0.5 badge"
      style="background: var(--badge-candidate)"
    >
      <IconFolderFilled data-suisou-icon="tiny" />
    </div>
  {/if}
</div>

<style>
  /* ★カード絵の上のバッジ。下地は --badge-* というドメインの色なので、
     ここの白は**テーマの文字色ではない**（text-main に寄せると意味が変わる）。
     Suisou の語彙を使わず、明示的な白のまま持つ。
     色は包む側が持ち、中のアイコンは currentColor で継ぐ。 */
  .badge {
    color: #fff;
  }
</style>
