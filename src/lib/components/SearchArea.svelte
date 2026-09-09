<script lang="ts">
  import { onMount } from 'svelte';
  import type { Card } from '$lib/types';
  import WhiteIcon from './icons/WhiteIcon.svelte';
  import RedIcon from './icons/RedIcon.svelte';
  import BlueIcon from './icons/BlueIcon.svelte';
  import GreenIcon from './icons/GreenIcon.svelte';
  import BlackIcon from './icons/BlackIcon.svelte';
  import LifeBurstIcon from './icons/LifeBurstIcon.svelte';
  import CardTypeIcon from './icons/CardTypeIcon.svelte';
  import LrigClassIcon from './icons/LrigClassIcon.svelte';
  import IconStar from '@tabler/icons-svelte/icons/star';
  import IconStarFilled from '@tabler/icons-svelte/icons/star-filled';
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check';
  import IconFolder from '@tabler/icons-svelte/icons/folder';
  import IconFolderFilled from '@tabler/icons-svelte/icons/folder-filled';
  import IconTag from '@tabler/icons-svelte/icons/tag';
  import IconTagFilled from '@tabler/icons-svelte/icons/tag-filled';
  import IconHexagonNumber1 from '@tabler/icons-svelte/icons/hexagon-number-1';
  import IconHexagonNumber1Filled from '@tabler/icons-svelte/icons/hexagon-number-1-filled';
  import IconHexagonNumber2 from '@tabler/icons-svelte/icons/hexagon-number-2';
  import IconHexagonNumber2Filled from '@tabler/icons-svelte/icons/hexagon-number-2-filled';
  import IconHexagonNumber3 from '@tabler/icons-svelte/icons/hexagon-number-3';
  import IconHexagonNumber3Filled from '@tabler/icons-svelte/icons/hexagon-number-3-filled';
  import IconCircleXFilled from '@tabler/icons-svelte/icons/circle-x-filled';
  import IconCircleX from '@tabler/icons-svelte/icons/circle-x';
  import IconAdjustments from '@tabler/icons-svelte/icons/adjustments';
  import IconZoomCancelFilled from '@tabler/icons-svelte/icons/zoom-cancel-filled';
  import IconSearch from '@tabler/icons-svelte/icons/search';
  import IconLoader from '@tabler/icons-svelte/icons/loader';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import SettingsPopup from './SettingsPopup.svelte';
  import SearchSettingsPopup from './SearchSettingsPopup.svelte';
  import TypeFilterContent from './dropdowns/TypeFilterContent.svelte';
  import LrigClassFilterContent from './dropdowns/LrigClassFilterContent.svelte';
  import TagFilterContent from './dropdowns/TagFilterContent.svelte';

  interface Props {
    hoveredCard: Card | null;
    selectedColors: Set<string>;
    selectedLevels: Set<number>;
    selectedCardTypes: Set<string>;
    selectedLrigClasses: Set<string>;
    selectedTags: Set<string>;
    lifeBurstFilter: boolean | null;
    candidateFilter: boolean;
    favoriteFilter: boolean;
    onColorFilter: (color: string) => void;
    onTextSearch: (text: string) => void;
    searchName: boolean;
    searchInText: boolean;
    onToggleSearchName: () => void;
    onToggleSearchInText: () => void;
    onLevelFilter: (level: number) => void;
    onLifeBurstFilter: () => void;
    onCardTypeFilter: (type: string) => void;
    onLrigClassFilter: (lrigClass: string) => void;
    onTagFilter: (tag: string) => void;
    onCandidateFilter: () => void;
    onFavoriteFilter: () => void;
    isLoggedIn: boolean;
    onReset: () => void;
    activeDropdown: 'type' | 'lrigClass' | 'tag' | null;
    onDropdownChange: (dropdown: 'type' | 'lrigClass' | 'tag' | null) => void;
    showLifeBurst: boolean;
    onToggleLifeBurst: () => void;
    showCandidateIcon: boolean;
    onToggleCandidateIcon: () => void;
    rotateLandscape: boolean;
    onToggleRotateLandscape: () => void;
  }

  let {
    hoveredCard,
    selectedColors,
    selectedLevels,
    selectedCardTypes,
    selectedLrigClasses,
    selectedTags,
    lifeBurstFilter,
    candidateFilter,
    favoriteFilter,
    onColorFilter,
    onTextSearch,
    searchName,
    searchInText,
    onToggleSearchName,
    onToggleSearchInText,
    onLevelFilter,
    onLifeBurstFilter,
    onCardTypeFilter,
    onLrigClassFilter,
    onTagFilter,
    onCandidateFilter,
    onFavoriteFilter,
    isLoggedIn,
    onReset,
    activeDropdown,
    onDropdownChange,
    showLifeBurst,
    onToggleLifeBurst,
    showCandidateIcon,
    onToggleCandidateIcon,
    rotateLandscape,
    onToggleRotateLandscape,
  }: Props = $props();

  let searchText = $state('');
  let isSettingsOpen = $state(false);
  let isSearchSettingsOpen = $state(false);
  let isLargeScreen = $state(false);

  // PCは拡張パネルが常時表示なので「開いていない」状態が存在しない。
  // → PCに入った時点で activeDropdown が空なら 'type' を選択済みにしておく。
  function seedForLargeScreen() {
    if (isLargeScreen && activeDropdown === null) onDropdownChange('type');
  }

  onMount(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    isLargeScreen = mq.matches;
    seedForLargeScreen();
    const handler = (e: MediaQueryListEvent) => {
      isLargeScreen = e.matches;
      seedForLargeScreen();
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  // テキスト検索は全カードに対する絞り込みを走らせるので、キー入力ごとの実行は
  // 低スペック端末で重い。150ms デバウンスしてから store へ反映する。
  let searchDebounce: ReturnType<typeof setTimeout>;
  function handleSearchInput() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => onTextSearch(searchText), 150);
  }

  function handleClear() {
    clearTimeout(searchDebounce);
    searchText = '';
    onTextSearch('');
  }

  function handleReset() {
    handleClear();
    onReset();
  }

  function handleMenuClick(name: 'type' | 'lrigClass' | 'tag') {
    if (isLargeScreen) {
      // PCは常時パネル表示。閉じる概念がないので常に選択（同じタブ再クリックでも維持）。
      onDropdownChange(name);
    } else {
      // スマホ/タブレットはドロップダウン。同じタブなら閉じ、違えば開く。
      onDropdownChange(activeDropdown === name ? null : name);
    }
  }

  // PCパネルに表示するタブ。activeDropdown が唯一の真実で、null時のみ既定の 'type'。
  let panelTab = $derived(activeDropdown ?? 'type');

  function clearPanelTab() {
    if (panelTab === 'type') {
      selectedCardTypes.forEach((t) => onCardTypeFilter(t));
    } else if (panelTab === 'lrigClass') {
      selectedLrigClasses.forEach((c) => onLrigClassFilter(c));
    } else {
      selectedTags.forEach((t) => onTagFilter(t));
    }
  }

  let isTypeFilterEnabled = $derived(selectedCardTypes.size > 0);
  let isLrigClassFilterEnabled = $derived(selectedLrigClasses.size > 0);
  let isTagFilterEnabled = $derived(selectedTags.size > 0);

  // ハイライトは画面幅に依らず単一ロジック:「アクティブなタブのボタン背景を明るくする」。
  // PCでは activeDropdown が常に非null（閉じる操作がない）なので、必ずどれか1つが明るい。
  // スマホはドロップダウンを開いたものだけが明るく、全て閉じていれば3つとも通常背景になる。
  let typeActive = $derived(activeDropdown === 'type');
  let lrigActive = $derived(activeDropdown === 'lrigClass');
  let tagActive = $derived(activeDropdown === 'tag');
</script>

<div class="px-2 pb-4 md:pb-1 lg:w-96" data-suisou-layout="stack">
  <!-- ホバープレビュー -->
  <div class="hidden lg:block aspect-[3/4] mb-2" data-suisou-surface="panel">
    {#if hoveredCard}
      <div class="w-full h-full" data-suisou-layout="row middle">
        <img
          src={cardImageUrl(hoveredCard.image)}
          class="max-w-full max-h-full object-contain"
          alt={hoveredCard.name}
        />
      </div>
    {/if}
  </div>

  <!-- 拡張メニュー（lg以上） -->
  <div class="ext-menu hidden lg:flex flex-col mb-2 min-h-0" data-suisou-surface="panel">
    <div data-suisou-layout="row between" class="mb-4">
      <h3 data-suisou-text="s16 w500">
        {#if panelTab === 'type'}カードタイプ検索
        {:else if panelTab === 'lrigClass'}ルリグタイプ/クラス検索
        {:else}タグ検索
        {/if}
      </h3>
      <button
        data-suisou-button="icon"
        type="button"
        onclick={clearPanelTab}
        aria-label="チェック全解除"
      >
        <IconCircleCheck />
      </button>
    </div>
    {#if panelTab === 'type'}
      <TypeFilterContent selectedTypes={selectedCardTypes} onToggle={onCardTypeFilter} />
    {:else if panelTab === 'lrigClass'}
      <LrigClassFilterContent {selectedLrigClasses} onToggle={onLrigClassFilter} />
    {:else}
      <TagFilterContent {selectedTags} onToggle={onTagFilter} />
    {/if}
  </div>

  <!-- 検索欄 -->
  <div data-suisou-layout="stack">
    <!-- お気に入り/候補カード/カードタイプ/クラス/タグ -->
    <div data-suisou-layout="row stretch" class="h-10 lg:h-8 mb-2">
      {#if isLoggedIn}
        <button
          type="button"
          class="cell"
          data-suisou-button="plain neutral"
          aria-pressed={favoriteFilter}
          onclick={onFavoriteFilter}
        >
          {#if favoriteFilter}<IconStarFilled />{:else}<IconStar />{/if}
        </button>
      {/if}

      <!-- 候補フィルタ: デスクトップは Folder が常時表示されるのでフィルタ不要 → md以上で非表示 -->
      <button
        type="button"
        id="folder-button"
        class="cell md:hidden"
        data-suisou-button="plain neutral"
        aria-pressed={candidateFilter}
        onclick={onCandidateFilter}
      >
        {#if candidateFilter}<IconFolderFilled />{:else}<IconFolder />{/if}
      </button>

      <div class="seg" style="--seg: 3" data-suisou-button-group="even">
        <button
          type="button"
          class="cell"
          data-suisou-button="neutral"
          aria-pressed={typeActive}
          onclick={() => handleMenuClick('type')}
        >
          <CardTypeIcon filled={isTypeFilterEnabled} />
        </button>
        <button
          type="button"
          class="cell"
          data-suisou-button="neutral"
          aria-pressed={lrigActive}
          onclick={() => handleMenuClick('lrigClass')}
        >
          <LrigClassIcon filled={isLrigClassFilterEnabled} />
        </button>
        <button
          type="button"
          class="cell"
          data-suisou-button="neutral"
          aria-pressed={tagActive}
          onclick={() => handleMenuClick('tag')}
        >
          {#if isTagFilterEnabled}<IconTagFilled />{:else}<IconTag />{/if}
        </button>
      </div>
    </div>

    <!-- 色/Lv/LB -->
    <div data-suisou-layout="row stretch" class="h-10 lg:h-8 mb-2">
      <!-- 色検索 -->
      <div class="seg" style="--seg: 5" data-suisou-button-group="even">
        {#each [['白', 'c-white'], ['赤', 'c-red'], ['青', 'c-blue'], ['緑', 'c-green'], ['黒', 'c-black']] as [color, colorClass] (color)}
          <button
            type="button"
            class="cell"
            data-suisou-button="neutral"
            aria-pressed={selectedColors.has(color)}
            onclick={() => onColorFilter(color)}
          >
            {#if color === '白'}
              <WhiteIcon class={colorClass} />
            {:else if color === '赤'}
              <RedIcon class={colorClass} />
            {:else if color === '青'}
              <BlueIcon class={colorClass} />
            {:else if color === '緑'}
              <GreenIcon class={colorClass} />
            {:else}
              <BlackIcon class={colorClass} />
            {/if}
          </button>
        {/each}
      </div>

      <!-- レベル検索 -->
      <div class="seg" style="--seg: 3" data-suisou-button-group="even">
        {#each [1, 2, 3] as level (level)}
          <button
            type="button"
            class="cell"
            data-suisou-button="neutral"
            aria-pressed={selectedLevels.has(level)}
            onclick={() => onLevelFilter(level)}
          >
            {#if level === 1}
              {#if selectedLevels.has(1)}
                <IconHexagonNumber1Filled />
              {:else}
                <IconHexagonNumber1 />
              {/if}
            {:else if level === 2}
              {#if selectedLevels.has(2)}
                <IconHexagonNumber2Filled />
              {:else}
                <IconHexagonNumber2 />
              {/if}
            {:else}
              {#if selectedLevels.has(3)}
                <IconHexagonNumber3Filled />
              {:else}
                <IconHexagonNumber3 />
              {/if}
            {/if}
          </button>
        {/each}
      </div>

      <!-- LB検索 -->
      <button
        type="button"
        class="cell w-10"
        data-suisou-button="plain neutral"
        aria-pressed={lifeBurstFilter !== null}
        onclick={onLifeBurstFilter}
      >
        {#if lifeBurstFilter === false}<IconCircleXFilled />{:else}<LifeBurstIcon />{/if}
      </button>
    </div>

    <!-- テキスト/クリア/その他ボタン -->
    <div data-suisou-layout="row stretch" class="h-10 lg:h-8">
      <!-- 設定ボタン -->
      <!-- ポップアップをボタンの内側に置くと、オプションのクリックが外側ボタンへ
           バブリングして即閉じる & button の入れ子で不正HTML。relative な div で
           トグルボタンとポップアップを兄弟にして解消する。 -->
      <div class="relative w-10">
        <button
          type="button"
          class="cell w-full"
          data-suisou-button="plain"
          onclick={() => {
            isSettingsOpen = !isSettingsOpen;
          }}
        >
          <IconAdjustments />
        </button>
        <SettingsPopup
          isOpen={isSettingsOpen}
          onClose={() => {
            isSettingsOpen = false;
          }}
          {showLifeBurst}
          {onToggleLifeBurst}
          {showCandidateIcon}
          {onToggleCandidateIcon}
          {rotateLandscape}
          {onToggleRotateLandscape}
        />
      </div>

      <!-- 検索入力 -->
      <div class="search seg" style="--seg: 1" data-suisou-button-group>
        <!-- 同上: ポップアップを button の外(relative div の兄弟)に出す -->
        <div class="relative w-12">
          <button
            type="button"
            class="cell w-full"
            data-suisou-button
            onclick={() => {
              isSearchSettingsOpen = !isSearchSettingsOpen;
            }}
          >
            {#if isSearchSettingsOpen}<IconZoomCancelFilled />{:else}<IconSearch />{/if}
          </button>
          <SearchSettingsPopup
            isOpen={isSearchSettingsOpen}
            onClose={() => {
              isSearchSettingsOpen = false;
            }}
            searchCardName={searchName}
            searchCardText={searchInText}
            onToggleSearchCardName={onToggleSearchName}
            onToggleSearchCardText={onToggleSearchInText}
          />
        </div>
        <input type="text" data-suisou-field bind:value={searchText} oninput={handleSearchInput} />
        <button type="button" class="cell clear" data-suisou-button onclick={handleClear}>
          <IconCircleX />
        </button>
      </div>

      <!-- リセットボタン -->
      <button
        type="button"
        class="cell w-10"
        data-suisou-button="plain"
        onclick={handleReset}
      >
        <IconLoader />
      </button>
    </div>
  </div>
</div>

<style>
  /* ★親に data-suisou-layout が付いていると
     :where([data-suisou-layout]) > * { flex: none } が効いて、
     子の Tailwind flex-1 は**詳細度に関係なく**潰れる（レイヤ無し ＞ レイヤ付き）。
     ここは属性ではなく現場の CSS で伸ばす。

     ★この要素に data-suisou-layout を足して直すのは駄目。
       [data-suisou-layout] { display: flex } もレイヤ無しなので、
       **`hidden`（display: none）まで殺してしまう**。 */
  .ext-menu {
    flex: 1 1 0;
  }

  /* ★段の中でボタンの幅を揃える。--seg はその群に入っているボタンの数。

     3個の群と5個の群を横に並べたとき、群ごとに幅が等分されると
     ボタンの大きさが揃わない。群の取り分をボタン数に比例させると、
     **段のどこにあるボタンも同じ幅**になる。

     ★元は Tailwind の flex-3 / flex-5 / flex-1 だったが、**黙って死んでいた**
       （2026-09-09 実測。Suisou 導入時から。あたしの移行より前）。
       Tailwind v4 のユーティリティは @layer utilities にあり、CSS のカスケードでは
       **レイヤ無しがレイヤ付きに必ず勝つ**。親に data-suisou-layout が付くと
       :where([data-suisou-layout]) > * { flex: none } が効いて、子の flex-N は
       詳細度に関係なく潰れる。

     ★Suisou 側の宿題: button-group を横に並べて全体で均等にする語が無い
       （`even` は1つの群の中でしか効かない）。実測 4 箇所。 */
  .seg {
    flex-grow: var(--seg);
    flex-shrink: 1;
    flex-basis: 0;
  }

  /* フィルタ盤の現場実装。器とトグルは Suisou（button-group / plain / aria-pressed）で、
     ここにあるのは升目の伸ばし方と検索欄の中身だけ。 */

  /* 升目。連結・単独とも領域いっぱいに広がる（角丸と余白の既定を外す） */
  /* 升目の余白ゼロ。伸ばし方と min-width は Suisou の連結（even）が持つようになった。
     高さは連結の既定（align-items: stretch）で埋まる */
  .cell {
    padding: 0;
  }

  /* ドメイン色。WIXOSS のカード5色は wixdex 自身のもの（app.css の :root で定義）。
     エラーの赤とカードの赤が同じ色に巻き込まれていたのを、ここで分離した */
  .cell :global(.c-white) {
    color: var(--card-white);
  }
  .cell :global(.c-red) {
    color: var(--card-red);
  }
  .cell :global(.c-blue) {
    color: var(--card-blue);
  }
  .cell :global(.c-green) {
    color: var(--card-green);
  }
  .cell :global(.c-black) {
    color: var(--card-black);
  }

  /* 入力の素肌化と焦点の輪は Suisou の連結（button-group × field）が持つようになった */
  .search {
    display: flex;
    align-items: center;
  }
  .clear {
    flex: none;
    width: 3rem;
  }
</style>
