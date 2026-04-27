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
  import StarIcon from './icons/StarIcon.svelte';
  import CircleCheckIcon from './icons/CircleCheckIcon.svelte';
  import FolderIcon from './icons/FolderIcon.svelte';
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
        <CircleCheckIcon />
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
      <div
        class="group flex md:flex-1 items-center justify-center w-10 h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all {favoriteFilter ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
        onclick={onFavoriteFilter}
      >
        <StarIcon
          filled={favoriteFilter}
          class="w-5 h-5 transition-all {favoriteFilter ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}"
        />
      </div>
      {/if}

      <div
        id="folder-button"
        class="group flex flex-1 items-center justify-center h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all {candidateFilter ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
        onclick={onCandidateFilter}
      >
        <FolderIcon
          mode={candidateFilter ? 'filled' : 'default'}
          class="w-5 h-5 transition-all {candidateFilter ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}"
        />
      </div>

      <div class="flex w-fit md:flex-3 rounded-lg border border-gray-600/50 overflow-hidden">
        <div
          class="group flex flex-1 items-center justify-center w-10 h-full cursor-pointer transition-all {activeDropdown === 'type' || expandedMenu === 'type' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
          onclick={() => handleMenuClick('type')}
        >
          <CardTypeIcon
            filled={isTypeFilterEnabled}
            class="w-5 h-5 transition-all {activeDropdown === 'type' || expandedMenu === 'type' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}"
          />
        </div>
        <div
          class="group flex flex-1 items-center justify-center w-10 h-full cursor-pointer transition-all {activeDropdown === 'lrigClass' || expandedMenu === 'lrigClass' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
          onclick={() => handleMenuClick('lrigClass')}
        >
          <LrigClassIcon
            filled={isLrigClassFilterEnabled}
            class="w-5 h-5 transition-all {activeDropdown === 'lrigClass' || expandedMenu === 'lrigClass' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}"
          />
        </div>
        <div
          class="group flex flex-1 items-center justify-center w-10 h-full cursor-pointer transition-all {activeDropdown === 'tag' || expandedMenu === 'tag' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
          onclick={() => handleMenuClick('tag')}
        >
          {#if isTagFilterEnabled}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 transition-all {activeDropdown === 'tag' || expandedMenu === 'tag' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M11.172 2a3 3 0 0 1 2.121 .879l7.71 7.71a3.41 3.41 0 0 1 0 4.822l-5.592 5.592a3.41 3.41 0 0 1 -4.822 0l-7.71 -7.71a3 3 0 0 1 -.879 -2.121v-5.172a4 4 0 0 1 4 -4zm-3.672 3.5a2 2 0 0 0 -1.995 1.85l-.005 .15a2 2 0 1 0 2 -2" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 transition-all {activeDropdown === 'tag' || expandedMenu === 'tag' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
            </svg>
          {/if}
        </div>
      </div>
    </div>

    <!-- 色/Lv/LB -->
    <div class="flex w-full h-8 mb-2">
      <!-- 色検索 -->
      <div class="flex flex-5 mr-2 rounded-lg border border-gray-600/50 overflow-hidden">
        {#each [['白', 'text-yellow-100', 'text-yellow-200'], ['赤', 'text-red-400', 'text-red-400'], ['青', 'text-blue-400', 'text-blue-400'], ['緑', 'text-green-400', 'text-green-400'], ['黒', 'text-purple-400', 'text-purple-500']] as [color, activeClass, inactiveClass]}
          <div
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
          </div>
        {/each}
      </div>

      <!-- レベル検索 -->
      <div class="flex flex-3 mr-2 rounded-lg border border-gray-600/50 overflow-hidden">
        {#each [1, 2, 3] as level}
          <div
            class="group flex flex-1 items-center justify-center cursor-pointer transition-all {selectedLevels.has(level) ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
            onclick={() => onLevelFilter(level)}
          >
            {#if level === 1}
              {#if selectedLevels.has(1)}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-gray-300 transition-all">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10.425 1.414a3.33 3.33 0 0 1 3.216 0l6.775 3.995c.067 .04 .127 .084 .18 .133l.008 .007l.107 .076a3.223 3.223 0 0 1 1.284 2.39l.005 .203v7.284c0 1.175 -.643 2.256 -1.623 2.793l-6.804 4.302c-.98 .538 -2.166 .538 -3.2 -.032l-6.695 -4.237a3.226 3.226 0 0 1 -1.678 -2.826v-7.285a3.21 3.21 0 0 1 1.65 -2.808zm.952 5.803l-.084 .076l-2 2l-.083 .094a1 1 0 0 0 0 1.226l.083 .094l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l.293 -.293v5.586l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-8l-.006 -.114c-.083 -.777 -1.008 -1.16 -1.617 -.67z" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                  <path d="M10 10l2 -2v8" />
                </svg>
              {/if}
            {:else if level === 2}
              {#if selectedLevels.has(2)}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-gray-300 transition-all">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10.425 1.414a3.33 3.33 0 0 1 3.216 0l6.775 3.995c.067 .04 .127 .084 .18 .133l.008 .007l.107 .076a3.223 3.223 0 0 1 1.284 2.39l.005 .203v7.284c0 1.175 -.643 2.256 -1.623 2.793l-6.804 4.302c-.98 .538 -2.166 .538 -3.2 -.032l-6.695 -4.237a3.226 3.226 0 0 1 -1.678 -2.826v-7.285a3.21 3.21 0 0 1 1.65 -2.808zm2.575 5.586h-3l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h3v2h-2l-.15 .005a2 2 0 0 0 -1.844 1.838l-.006 .157v2l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h3l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007h-3v-2h2l.15 -.005a2 2 0 0 0 1.844 -1.838l.006 -.157v-2l-.005 -.15a2 2 0 0 0 -1.838 -1.844l-.157 -.006z" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                  <path d="M10 8h3a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3" />
                </svg>
              {/if}
            {:else}
              {#if selectedLevels.has(3)}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-gray-300 transition-all">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10.425 1.414a3.33 3.33 0 0 1 3.216 0l6.775 3.995c.067 .04 .127 .084 .18 .133l.008 .007l.107 .076a3.223 3.223 0 0 1 1.284 2.39l.005 .203v7.284c0 1.175 -.643 2.256 -1.623 2.793l-6.804 4.302c-.98 .538 -2.166 .538 -3.2 -.032l-6.695 -4.237a3.226 3.226 0 0 1 -1.678 -2.826v-7.285a3.21 3.21 0 0 1 1.65 -2.808zm2.575 5.586h-2l-.15 .005a2 2 0 0 0 -1.85 1.995a1 1 0 0 0 1.974 .23l.02 -.113l.006 -.117h2v2h-2l-.133 .007c-1.111 .12 -1.154 1.73 -.128 1.965l.128 .021l.133 .007h2v2h-2l-.007 -.117a1 1 0 0 0 -1.993 .117a2 2 0 0 0 1.85 1.995l.15 .005h2l.15 -.005a2 2 0 0 0 1.844 -1.838l.006 -.157v-2l-.005 -.15a1.988 1.988 0 0 0 -.17 -.667l-.075 -.152l-.019 -.032l.02 -.03a2.01 2.01 0 0 0 .242 -.795l.007 -.174v-2l-.005 -.15a2 2 0 0 0 -1.838 -1.844l-.157 -.006z" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                  <path d="M10 9a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1" />
                </svg>
              {/if}
            {/if}
          </div>
        {/each}
      </div>

      <!-- LB検索 -->
      <div
        class="group flex items-center justify-center w-10 h-full rounded-lg border border-gray-600/50 cursor-pointer transition-all {lifeBurstFilter !== null ? 'bg-zinc-500/30' : 'bg-zinc-600/10'}"
        onclick={onLifeBurstFilter}
      >
        {#if lifeBurstFilter === false}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-gray-300 transition-all">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 2l.642 .005l.616 .017l.299 .013l.579 .034l.553 .046c4.687 .455 6.65 2.333 7.166 6.906l.03 .29l.046 .553l.041 .727l.006 .15l.017 .617l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.455 4.687 -2.333 6.65 -6.906 7.166l-.29 .03l-.553 .046l-.727 .041l-.15 .006l-.617 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.687 -.455 -6.65 -2.333 -7.166 -6.906l-.03 -.29l-.046 -.553l-.041 -.727l-.006 -.15l-.017 -.617l-.004 -.318v-.648l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.455 -4.687 2.333 -6.65 6.906 -7.166l.29 -.03l.553 -.046l.727 -.041l.15 -.006l.617 -.017c.21 -.003 .424 -.005 .642 -.005zm-1.489 7.14a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z" />
          </svg>
        {:else}
          <LifeBurstIcon class="w-5 h-5 transition-all {lifeBurstFilter === true ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}" />
        {/if}
      </div>
    </div>

    <!-- テキスト/クリア/その他ボタン -->
    <div class="flex w-full h-8">
      <!-- 設定ボタン -->
      <div class="relative flex items-center justify-center w-10 h-full mr-2 rounded-lg bg-zinc-600/10 border border-gray-600/50 text-gray-400 hover:text-white cursor-pointer transition-all"
        onclick={() => { isSettingsOpen = !isSettingsOpen; }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M4 6l8 0" /><path d="M16 6l4 0" />
          <path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M4 12l2 0" /><path d="M10 12l10 0" />
          <path d="M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M4 18l11 0" /><path d="M19 18l1 0" />
        </svg>
        <SettingsPopup
          isOpen={isSettingsOpen}
          onClose={() => { isSettingsOpen = false; }}
          {showLifeBurst}
          {onToggleLifeBurst}
          {showCandidateIcon}
          {onToggleCandidateIcon}
        />
      </div>

      <!-- 検索入力 -->
      <div class="flex flex-1 mr-2 items-center bg-zinc-600/10 border border-gray-600/50 rounded-lg focus-within:ring-2 focus-within:ring-gray-500">
        <div
          class="relative flex w-12 h-full items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all"
          onclick={() => { isSearchSettingsOpen = !isSearchSettingsOpen; }}
        >
          {#if isSearchSettingsOpen}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-gray-300">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 3.072a8 8 0 0 1 2.32 11.834l5.387 5.387a1 1 0 0 1 -1.414 1.414l-5.388 -5.387a8 8 0 0 1 -12.905 -6.32l.005 -.285a8 8 0 0 1 11.995 -6.643m-5.293 4.22a1 1 0 0 0 -1.414 1.415l1.292 1.293l-1.292 1.293a1 1 0 0 0 1.414 1.414l1.293 -1.292l1.293 1.292a1 1 0 0 0 1.414 -1.414l-1.292 -1.293l1.292 -1.293a1 1 0 1 0 -1.414 -1.414l-1.293 1.292z" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M21 21l-6 -6" />
            </svg>
          {/if}
          <SearchSettingsPopup
            isOpen={isSearchSettingsOpen}
            onClose={() => { isSearchSettingsOpen = false; }}
            {searchCardName}
            {searchCardText}
            onToggleSearchCardName={() => { searchCardName = !searchCardName; }}
            onToggleSearchCardText={() => { searchCardText = !searchCardText; }}
          />
        </div>
        <input
          type="text"
          class="w-full h-full pb-[2px] ml-2 text-sm text-white placeholder-gray-400 focus:outline-none bg-transparent"
          bind:value={searchText}
          oninput={() => onTextSearch(searchText)}
        />
        <div
          class="flex w-12 h-full items-center justify-center text-gray-400 hover:text-white cursor-pointer rounded-full transition-all"
          onclick={handleClear}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M10 10l4 4m0 -4l-4 4" />
          </svg>
        </div>
      </div>

      <!-- リセットボタン -->
      <div
        class="flex w-10 aspect-square bg-zinc-600/10 border border-gray-600/50 rounded-lg items-center justify-center text-gray-400 hover:text-white cursor-pointer"
        onclick={handleReset}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 6l0 -3" /><path d="M16.25 7.75l2.15 -2.15" />
          <path d="M18 12l3 0" /><path d="M16.25 16.25l2.15 2.15" />
          <path d="M12 18l0 3" /><path d="M7.75 16.25l-2.15 2.15" />
          <path d="M6 12l-3 0" /><path d="M7.75 7.75l-2.15 -2.15" />
        </svg>
      </div>
    </div>
  </div>
</div>
