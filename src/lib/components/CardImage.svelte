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
      style="background: var(--badge-lifeburst)"
    >
      <LifeBurstIcon data-suisou-text="fs-12" />
    </div>
  {/if}
  {#if showCandidateIcon && isInCandidates && isImageLoaded}
    <div
      class="badge at-top"
      style="background: var(--badge-candidate)"
    >
      <IconFolderFilled data-suisou-text="fs-12" />
    </div>
  {/if}
</div>

<style>
  /* 横向きに寝かせたカード。器の内寸（cqw/cqh）を入れ替えて 90 度回す。
     ★LazyImage に渡す class なので scoped ハッシュが付かない ―― :global で受ける。 */
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

  /* ★枠は呼ぶ側の器の幅いっぱいになる。大きさを決めるのは呼ぶ側（.card-img に width: 100%）。
     inline-block だと、Suisou の row（子は flex: none）に入れたとき枠が画像の原寸（868px）まで膨らみ、
     一覧とフォルダでカードが原寸で出た（2026-09-13 に本番で発覚。Tailwind の preflight が
     img に max-width: 100% を当てていた間は隠れていた） */
  .frame {
    position: relative;
    display: block;
    width: 100%;
  }
  /* 横向きに寝かせる表示。器がカードの比を持ち、中身を切り抜く。
     container-type: size は中の実寸を cqw/cqh で拾うため */
  .frame.rotated {
    aspect-ratio: 12 / 17;
    overflow: hidden;
    container-type: size;
  }

  /* 角のしるし。丸い下地に載せる */
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

  /* ★カード絵の上のバッジ。下地は --badge-* というドメインの色なので、
     ここの白は**テーマの文字色ではない**（text-main に寄せると意味が変わる）。
     Suisou の語彙を使わず、明示的な白のまま持つ。
     色は包む側が持ち、中のアイコンは currentColor で継ぐ。 */
  .badge {
    color: #fff;
  }
</style>
