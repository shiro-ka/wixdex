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
  import { filterToggle, filterIcon, filterBorder, filterGroup } from '$lib/styles';
  import clsx from 'clsx';

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
    hoveredCard, selectedColors, selectedLevels, selectedCardTypes,
    selectedLrigClasses, selectedTags, lifeBurstFilter, candidateFilter,
    favoriteFilter, onColorFilter, onTextSearch, searchName, searchInText,
    onToggleSearchName, onToggleSearchInText, onLevelFilter,
    onLifeBurstFilter, onCardTypeFilter, onLrigClassFilter, onTagFilter,
    onCandidateFilter, onFavoriteFilter, isLoggedIn, onReset, activeDropdown,
    onDropdownChange, showLifeBurst, onToggleLifeBurst, showCandidateIcon,
    onToggleCandidateIcon, rotateLandscape, onToggleRotateLandscape,
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
      selectedCardTypes.forEach(t => onCardTypeFilter(t));
    } else if (panelTab === 'lrigClass') {
      selectedLrigClasses.forEach(c => onLrigClassFilter(c));
    } else {
      selectedTags.forEach(t => onTagFilter(t));
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

<div class="flex flex-col px-2 pb-4 md:pb-1 lg:w-96">
  <!-- ホバープレビュー -->
  <div class="hidden lg:block w-full aspect-[3/4] p-4 mb-2 bg-gray-600/10 rounded-xl">
    {#if hoveredCard}
      <div class="w-full h-full flex items-center justify-center">
        <img
          src={cardImageUrl(hoveredCard.image)}
          class="max-w-full max-h-full object-contain"
          alt={hoveredCard.name}
        />
      </div>
    {/if}
  </div>

  <!-- 拡張メニュー（lg以上） -->
  <div class="hidden lg:flex flex-1 flex-col mb-2 bg-gray-600/10 border border-gray-600/50 rounded-xl p-4 min-h-0">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-base text-white">
        {#if panelTab === 'type'}カードタイプ検索
        {:else if panelTab === 'lrigClass'}ルリグタイプ/クラス検索
        {:else}タグ検索
        {/if}
      </h3>
      <button
        onclick={clearPanelTab}
        class="text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg p-1 transition-all"
        aria-label="チェック全解除"
      >
        <IconCircleCheck class="w-5 h-5" />
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
  <div class="flex flex-col">
    <!-- お気に入り/候補カード/カードタイプ/クラス/タグ -->
    <div class="flex w-full h-10 lg:h-8 mb-2">
      {#if isLoggedIn}
      <button
        type="button"
        class={clsx(filterToggle({ active: favoriteFilter }), 'flex-1 h-full mr-2', filterBorder)}
        onclick={onFavoriteFilter}
      >
        {#if favoriteFilter}
          <IconStarFilled class={filterIcon({ active: true })} />
        {:else}
          <IconStar class={filterIcon({ active: false })} />
        {/if}
      </button>
      {/if}

      <!-- 候補フィルタ: デスクトップは Folder が常時表示されるのでフィルタ不要 → md以上で非表示 -->
      <button
        type="button"
        id="folder-button"
        class={clsx(filterToggle({ active: candidateFilter }), 'flex-1 h-full mr-2 md:hidden', filterBorder)}
        onclick={onCandidateFilter}
      >
        {#if candidateFilter}
          <IconFolderFilled class={filterIcon({ active: true })} />
        {:else}
          <IconFolder class={filterIcon({ active: false })} />
        {/if}
      </button>

      <div class="flex flex-3 {filterGroup}">
        <button
          type="button"
          class={clsx(filterToggle({ active: typeActive }), 'flex-1 w-10 h-full')}
          onclick={() => handleMenuClick('type')}
        >
          <CardTypeIcon filled={isTypeFilterEnabled} class={filterIcon({ active: typeActive })} />
        </button>
        <button
          type="button"
          class={clsx(filterToggle({ active: lrigActive }), 'flex-1 w-10 h-full')}
          onclick={() => handleMenuClick('lrigClass')}
        >
          <LrigClassIcon filled={isLrigClassFilterEnabled} class={filterIcon({ active: lrigActive })} />
        </button>
        <button
          type="button"
          class={clsx(filterToggle({ active: tagActive }), 'flex-1 w-10 h-full')}
          onclick={() => handleMenuClick('tag')}
        >
          {#if isTagFilterEnabled}
            <IconTagFilled class={filterIcon({ active: tagActive })} />
          {:else}
            <IconTag class={filterIcon({ active: tagActive })} />
          {/if}
        </button>
      </div>
    </div>

    <!-- 色/Lv/LB -->
    <div class="flex w-full h-10 lg:h-8 mb-2">
      <!-- 色検索 -->
      <div class="flex flex-5 mr-2 {filterGroup}">
        {#each [['白', 'text-yellow-100', 'text-yellow-200'], ['赤', 'text-red-400', 'text-red-400'], ['青', 'text-blue-400', 'text-blue-400'], ['緑', 'text-green-400', 'text-green-400'], ['黒', 'text-purple-400', 'text-purple-500']] as [color, activeClass, inactiveClass] (color)}
          <button
            type="button"
            class={clsx(filterToggle({ active: selectedColors.has(color) }), 'flex-1')}
            onclick={() => onColorFilter(color)}
          >
            {#if color === '白'}
              <WhiteIcon class="w-5 h-5 transition-all {selectedColors.has(color) ? activeClass : inactiveClass}" />
            {:else if color === '赤'}
              <RedIcon class="w-5 h-5 transition-all {selectedColors.has(color) ? activeClass : inactiveClass}" />
            {:else if color === '青'}
              <BlueIcon class="w-5 h-5 transition-all {selectedColors.has(color) ? activeClass : inactiveClass}" />
            {:else if color === '緑'}
              <GreenIcon class="w-5 h-5 transition-all {selectedColors.has(color) ? activeClass : inactiveClass}" />
            {:else}
              <BlackIcon class="w-5 h-5 transition-all {selectedColors.has(color) ? activeClass : inactiveClass}" />
            {/if}
          </button>
        {/each}
      </div>

      <!-- レベル検索 -->
      <div class="flex flex-3 mr-2 {filterGroup}">
        {#each [1, 2, 3] as level (level)}
          <button
            type="button"
            class={clsx(filterToggle({ active: selectedLevels.has(level) }), 'flex-1')}
            onclick={() => onLevelFilter(level)}
          >
            {#if level === 1}
              {#if selectedLevels.has(1)}
                <IconHexagonNumber1Filled class={filterIcon({ active: true })} />
              {:else}
                <IconHexagonNumber1 class={filterIcon({ active: false })} />
              {/if}
            {:else if level === 2}
              {#if selectedLevels.has(2)}
                <IconHexagonNumber2Filled class={filterIcon({ active: true })} />
              {:else}
                <IconHexagonNumber2 class={filterIcon({ active: false })} />
              {/if}
            {:else}
              {#if selectedLevels.has(3)}
                <IconHexagonNumber3Filled class={filterIcon({ active: true })} />
              {:else}
                <IconHexagonNumber3 class={filterIcon({ active: false })} />
              {/if}
            {/if}
          </button>
        {/each}
      </div>

      <!-- LB検索 -->
      <button
        type="button"
        class={clsx(filterToggle({ active: lifeBurstFilter !== null }), 'w-10 h-full', filterBorder)}
        onclick={onLifeBurstFilter}
      >
        {#if lifeBurstFilter === false}
          <IconCircleXFilled class={filterIcon({ active: true })} />
        {:else}
          <LifeBurstIcon class={filterIcon({ active: lifeBurstFilter === true })} />
        {/if}
      </button>
    </div>

    <!-- テキスト/クリア/その他ボタン -->
    <div class="flex w-full h-10 lg:h-8">
      <!-- 設定ボタン -->
      <!-- ポップアップをボタンの内側に置くと、オプションのクリックが外側ボタンへ
           バブリングして即閉じる & button の入れ子で不正HTML。relative な div で
           トグルボタンとポップアップを兄弟にして解消する。 -->
      <div class="relative w-10 h-full mr-2">
        <button
          type="button"
          class="flex items-center justify-center w-full h-full bg-zinc-600/10 {filterBorder} text-gray-400 hover:text-white cursor-pointer transition-all"
          onclick={() => { isSettingsOpen = !isSettingsOpen; }}
        >
          <IconAdjustments class="w-5 h-5" />
        </button>
        <SettingsPopup
          isOpen={isSettingsOpen}
          onClose={() => { isSettingsOpen = false; }}
          {showLifeBurst}
          {onToggleLifeBurst}
          {showCandidateIcon}
          {onToggleCandidateIcon}
          {rotateLandscape}
          {onToggleRotateLandscape}
        />
      </div>

      <!-- 検索入力 -->
      <div class="flex flex-1 mr-2 items-center bg-zinc-600/10 {filterBorder} has-[input:focus]:ring-2 has-[input:focus]:ring-gray-500">
        <!-- 同上: ポップアップを button の外(relative div の兄弟)に出す -->
        <div class="relative w-12 h-full">
          <button
            type="button"
            class="flex w-full h-full items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all"
            onclick={() => { isSearchSettingsOpen = !isSearchSettingsOpen; }}
          >
            {#if isSearchSettingsOpen}
              <IconZoomCancelFilled class="w-5 h-5 text-gray-300" />
            {:else}
              <IconSearch class="w-5 h-5" />
            {/if}
          </button>
          <SearchSettingsPopup
            isOpen={isSearchSettingsOpen}
            onClose={() => { isSearchSettingsOpen = false; }}
            searchCardName={searchName}
            searchCardText={searchInText}
            onToggleSearchCardName={onToggleSearchName}
            onToggleSearchCardText={onToggleSearchInText}
          />
        </div>
        <input
          type="text"
          class="w-full h-full pb-[2px] ml-2 text-sm text-white placeholder-gray-400 focus:outline-none bg-transparent"
          bind:value={searchText}
          oninput={handleSearchInput}
        />
        <button
          type="button"
          class="flex w-12 h-full items-center justify-center text-gray-400 hover:text-white cursor-pointer rounded-full transition-all"
          onclick={handleClear}
        >
          <IconCircleX class="w-5 h-5" />
        </button>
      </div>

      <!-- リセットボタン -->
      <button
        type="button"
        class="flex w-10 aspect-square bg-zinc-600/10 {filterBorder} items-center justify-center text-gray-400 hover:text-white cursor-pointer"
        onclick={handleReset}
      >
        <IconLoader class="w-5 h-5" />
      </button>
    </div>
  </div>
</div>
