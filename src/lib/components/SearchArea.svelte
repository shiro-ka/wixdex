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
  }

  let {
    hoveredCard, selectedColors, selectedLevels, selectedCardTypes,
    selectedLrigClasses, selectedTags, lifeBurstFilter, candidateFilter,
    favoriteFilter, onColorFilter, onTextSearch, onLevelFilter,
    onLifeBurstFilter, onCardTypeFilter, onLrigClassFilter, onTagFilter,
    onCandidateFilter, onFavoriteFilter, isLoggedIn, onReset, activeDropdown,
    onDropdownChange, showLifeBurst, onToggleLifeBurst, showCandidateIcon,
    onToggleCandidateIcon,
  }: Props = $props();

  let searchText = $state('');
  let isSettingsOpen = $state(false);
  let isSearchSettingsOpen = $state(false);
  let searchCardName = $state(true);
  let searchCardText = $state(false);
  let expandedMenu = $state<'type' | 'lrigClass' | 'tag'>('type');
  let isLargeScreen = $state(false);

  onMount(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    isLargeScreen = mq.matches;
    const handler = (e: MediaQueryListEvent) => { isLargeScreen = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  function handleClear() {
    searchText = '';
    onTextSearch('');
  }

  function handleReset() {
    handleClear();
    onReset();
  }

  function toggleDropdown(name: 'type' | 'lrigClass' | 'tag') {
    onDropdownChange(activeDropdown === name ? null : name);
  }

  function handleMenuClick(name: 'type' | 'lrigClass' | 'tag') {
    if (!isLargeScreen) toggleDropdown(name);
    expandedMenu = name;
  }

  function clearExpandedMenu() {
    if (expandedMenu === 'type') {
      selectedCardTypes.forEach(t => onCardTypeFilter(t));
    } else if (expandedMenu === 'lrigClass') {
      selectedLrigClasses.forEach(c => onLrigClassFilter(c));
    } else {
      selectedTags.forEach(t => onTagFilter(t));
    }
  }

  let isTypeFilterEnabled = $derived(selectedCardTypes.size > 0);
  let isLrigClassFilterEnabled = $derived(selectedLrigClasses.size > 0);
  let isTagFilterEnabled = $derived(selectedTags.size > 0);
</script>

<div class="flex flex-col px-2 pb-4 md:pb-1 md:w-96">
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
        {#if expandedMenu === 'type'}カードタイプ検索
        {:else if expandedMenu === 'lrigClass'}ルリグタイプ/クラス検索
        {:else}タグ検索
        {/if}
      </h3>
      <button
        onclick={clearExpandedMenu}
        class="!text-gray-400 hover:!text-gray-300 !bg-transparent hover:bg-gray-700/50 rounded-lg p-1 transition-all"
        aria-label="チェック全解除"
      >
        <IconCircleCheck class="w-5 h-5" />
      </button>
    </div>
    {#if expandedMenu === 'type'}
      <TypeFilterContent selectedTypes={selectedCardTypes} onToggle={onCardTypeFilter} />
    {:else if expandedMenu === 'lrigClass'}
      <LrigClassFilterContent {selectedLrigClasses} onToggle={onLrigClassFilter} />
    {:else}
      <TagFilterContent {selectedTags} onToggle={onTagFilter} />
    {/if}
  </div>

  <!-- 検索欄 -->
  <div class="flex flex-col">
    <!-- お気に入り/候補カード/カードタイプ/クラス/タグ -->
    <div class="flex w-full h-8 mb-2">
      {#if isLoggedIn}
      <button
        type="button"
        class="group flex md:flex-1 items-center justify-center w-10 h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all {favoriteFilter ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
        onclick={onFavoriteFilter}
      >
        {#if favoriteFilter}
          <IconStarFilled class="w-5 h-5 text-gray-300 transition-all" />
        {:else}
          <IconStar class="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all" />
        {/if}
      </button>
      {/if}

      <button
        type="button"
        id="folder-button"
        class="group flex flex-1 items-center justify-center h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all {candidateFilter ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
        onclick={onCandidateFilter}
      >
        {#if candidateFilter}
          <IconFolderFilled class="w-5 h-5 text-gray-300 transition-all" />
        {:else}
          <IconFolder class="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all" />
        {/if}
      </button>

      <div class="flex w-fit md:flex-3 rounded-lg border border-gray-600/50 overflow-hidden">
        <button
          type="button"
          class="group flex flex-1 items-center justify-center w-10 h-full cursor-pointer transition-all {activeDropdown === 'type' || expandedMenu === 'type' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
          onclick={() => handleMenuClick('type')}
        >
          <CardTypeIcon
            filled={isTypeFilterEnabled}
            class="w-5 h-5 transition-all {activeDropdown === 'type' || expandedMenu === 'type' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}"
          />
        </button>
        <button
          type="button"
          class="group flex flex-1 items-center justify-center w-10 h-full cursor-pointer transition-all {activeDropdown === 'lrigClass' || expandedMenu === 'lrigClass' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
          onclick={() => handleMenuClick('lrigClass')}
        >
          <LrigClassIcon
            filled={isLrigClassFilterEnabled}
            class="w-5 h-5 transition-all {activeDropdown === 'lrigClass' || expandedMenu === 'lrigClass' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}"
          />
        </button>
        <button
          type="button"
          class="group flex flex-1 items-center justify-center w-10 h-full cursor-pointer transition-all {activeDropdown === 'tag' || expandedMenu === 'tag' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
          onclick={() => handleMenuClick('tag')}
        >
          {#if isTagFilterEnabled}
            <IconTagFilled class="w-5 h-5 transition-all {activeDropdown === 'tag' || expandedMenu === 'tag' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}" />
          {:else}
            <IconTag class="w-5 h-5 transition-all {activeDropdown === 'tag' || expandedMenu === 'tag' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}" />
          {/if}
        </button>
      </div>
    </div>

    <!-- 色/Lv/LB -->
    <div class="flex w-full h-8 mb-2">
      <!-- 色検索 -->
      <div class="flex flex-5 mr-2 rounded-lg border border-gray-600/50 overflow-hidden">
        {#each [['白', 'text-yellow-100', 'text-yellow-200'], ['赤', 'text-red-400', 'text-red-400'], ['青', 'text-blue-400', 'text-blue-400'], ['緑', 'text-green-400', 'text-green-400'], ['黒', 'text-purple-400', 'text-purple-500']] as [color, activeClass, inactiveClass]}
          <button
            type="button"
            class="flex flex-1 items-center justify-center cursor-pointer transition-all {selectedColors.has(color) ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
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
      <div class="flex flex-3 mr-2 rounded-lg border border-gray-600/50 overflow-hidden">
        {#each [1, 2, 3] as level}
          <button
            type="button"
            class="group flex flex-1 items-center justify-center cursor-pointer transition-all {selectedLevels.has(level) ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
            onclick={() => onLevelFilter(level)}
          >
            {#if level === 1}
              {#if selectedLevels.has(1)}
                <IconHexagonNumber1Filled class="w-5 h-5 text-gray-300 transition-all" />
              {:else}
                <IconHexagonNumber1 class="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all" />
              {/if}
            {:else if level === 2}
              {#if selectedLevels.has(2)}
                <IconHexagonNumber2Filled class="w-5 h-5 text-gray-300 transition-all" />
              {:else}
                <IconHexagonNumber2 class="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all" />
              {/if}
            {:else}
              {#if selectedLevels.has(3)}
                <IconHexagonNumber3Filled class="w-5 h-5 text-gray-300 transition-all" />
              {:else}
                <IconHexagonNumber3 class="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all" />
              {/if}
            {/if}
          </button>
        {/each}
      </div>

      <!-- LB検索 -->
      <button
        type="button"
        class="group flex items-center justify-center w-10 h-full rounded-lg border border-gray-600/50 cursor-pointer transition-all {lifeBurstFilter !== null ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
        onclick={onLifeBurstFilter}
      >
        {#if lifeBurstFilter === false}
          <IconCircleXFilled class="w-5 h-5 text-gray-300 transition-all" />
        {:else}
          <LifeBurstIcon class="w-5 h-5 transition-all {lifeBurstFilter === true ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}" />
        {/if}
      </button>
    </div>

    <!-- テキスト/クリア/その他ボタン -->
    <div class="flex w-full h-8">
      <!-- 設定ボタン -->
      <button
        type="button"
        class="relative flex items-center justify-center w-10 h-full mr-2 rounded-lg bg-zinc-600/10 border border-gray-600/50 text-gray-400 hover:text-white cursor-pointer transition-all"
        onclick={() => { isSettingsOpen = !isSettingsOpen; }}
      >
        <IconAdjustments class="w-5 h-5" />
        <SettingsPopup
          isOpen={isSettingsOpen}
          onClose={() => { isSettingsOpen = false; }}
          {showLifeBurst}
          {onToggleLifeBurst}
          {showCandidateIcon}
          {onToggleCandidateIcon}
        />
      </button>

      <!-- 検索入力 -->
      <div class="flex flex-1 mr-2 items-center bg-zinc-600/10 border border-gray-600/50 rounded-lg focus-within:ring-2 focus-within:ring-gray-500">
        <button
          type="button"
          class="relative flex w-12 h-full items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all"
          onclick={() => { isSearchSettingsOpen = !isSearchSettingsOpen; }}
        >
          {#if isSearchSettingsOpen}
            <IconZoomCancelFilled class="w-5 h-5 text-gray-300" />
          {:else}
            <IconSearch class="w-5 h-5" />
          {/if}
          <SearchSettingsPopup
            isOpen={isSearchSettingsOpen}
            onClose={() => { isSearchSettingsOpen = false; }}
            {searchCardName}
            {searchCardText}
            onToggleSearchCardName={() => { searchCardName = !searchCardName; }}
            onToggleSearchCardText={() => { searchCardText = !searchCardText; }}
          />
        </button>
        <input
          type="text"
          class="w-full h-full pb-[2px] ml-2 text-sm text-white placeholder-gray-400 focus:outline-none bg-transparent"
          bind:value={searchText}
          oninput={() => onTextSearch(searchText)}
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
        class="flex w-10 aspect-square bg-zinc-600/10 border border-gray-600/50 rounded-lg items-center justify-center text-gray-400 hover:text-white cursor-pointer"
        onclick={handleReset}
      >
        <IconLoader class="w-5 h-5" />
      </button>
    </div>
  </div>
</div>
