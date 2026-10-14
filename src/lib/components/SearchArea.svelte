<script lang="ts">
  import { onMount } from 'svelte';
  import type { Card } from '$lib/types';
  import type { FilterStore } from '$lib/stores/filterStore.svelte';
  import type { SettingsStore } from '$lib/stores/settings.svelte';
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
    filter: FilterStore;
    settings: SettingsStore;
    isLoggedIn: boolean;
    activeDropdown: 'type' | 'lrigClass' | 'tag' | null;
    onDropdownChange: (dropdown: 'type' | 'lrigClass' | 'tag' | null) => void;
  }

  let {
    hoveredCard,
    filter,
    settings,
    isLoggedIn,
    activeDropdown,
    onDropdownChange,
  }: Props = $props();

  let searchText = $state('');
  let isSettingsOpen = $state(false);
  let isSearchSettingsOpen = $state(false);
  let isLargeScreen = $state(false);

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

  let searchDebounce: ReturnType<typeof setTimeout>;
  function handleSearchInput() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => filter.setSearchText(searchText), 150);
  }

  function handleClear() {
    clearTimeout(searchDebounce);
    searchText = '';
    filter.setSearchText('');
  }

  function handleReset() {
    handleClear();
    filter.reset();
  }

  function handleMenuClick(name: 'type' | 'lrigClass' | 'tag') {
    if (isLargeScreen) {
      onDropdownChange(name);
    } else {
      onDropdownChange(activeDropdown === name ? null : name);
    }
  }

  let panelTab = $derived(activeDropdown ?? 'type');

  function clearPanelTab() {
    if (panelTab === 'type') {
      filter.selectedCardTypes.forEach((t) => filter.toggleCardType(t));
    } else if (panelTab === 'lrigClass') {
      filter.selectedLrigClasses.forEach((c) => filter.toggleLrigClass(c));
    } else {
      filter.selectedTags.forEach((t) => filter.toggleTag(t));
    }
  }

  let isTypeFilterEnabled = $derived(filter.selectedCardTypes.size > 0);
  let isLrigClassFilterEnabled = $derived(filter.selectedLrigClasses.size > 0);
  let isTagFilterEnabled = $derived(filter.selectedTags.size > 0);

  let typeActive = $derived(activeDropdown === 'type');
  let lrigActive = $derived(activeDropdown === 'lrigClass');
  let tagActive = $derived(activeDropdown === 'tag');
</script>

<div class="pane" data-suisou-layout="stack gap-2 m:grow">
  <div data-suisou-tray data-suisou="m>hidden" class="preview">
    <div class="fill" data-suisou-layout="row middle">
      {#if hoveredCard}
        <img
          src={cardImageUrl(hoveredCard.image)}
          class="preview-img"
          alt={hoveredCard.name}
        />
      {/if}
    </div>
  </div>

  <div data-suisou-tray data-suisou-layout="stack" data-suisou="m>hidden" class="ext-menu">
    <div data-suisou-layout="row between" class="menu-head">
      <h3 data-suisou-text="fs-16 fw-500">
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
      <TypeFilterContent selectedTypes={filter.selectedCardTypes} onToggle={filter.toggleCardType} />
    {:else if panelTab === 'lrigClass'}
      <LrigClassFilterContent selectedLrigClasses={filter.selectedLrigClasses} onToggle={filter.toggleLrigClass} />
    {:else}
      <TagFilterContent selectedTags={filter.selectedTags} onToggle={filter.toggleTag} />
    {/if}
  </div>

  <div data-suisou-layout="stack gap-2">
    <div data-suisou-layout="row stretch" class="bar">
      {#if isLoggedIn}
        <button
          type="button"
          class="cell"
          data-suisou-button="outline"
          aria-pressed={filter.favoriteFilter}
          onclick={filter.toggleFavorite}
        >
          {#if filter.favoriteFilter}<IconStarFilled />{:else}<IconStar />{/if}
        </button>
      {/if}

      <button
        type="button"
        id="folder-button"
        data-suisou-button="outline"
        data-suisou="s:hidden" class="cell"
        aria-pressed={filter.candidateFilter}
        onclick={filter.toggleCandidate}
      >
        {#if filter.candidateFilter}<IconFolderFilled />{:else}<IconFolder />{/if}
      </button>

      <div data-suisou-layout="grow row gap-0" style="--suisou-grow: 3" data-suisou-tray>
        <button
          type="button"
          class="cell"
          data-suisou-button
          data-suisou-layout="grow"
          aria-pressed={typeActive}
          onclick={() => handleMenuClick('type')}
        >
          <CardTypeIcon filled={isTypeFilterEnabled} />
        </button>
        <button
          type="button"
          class="cell"
          data-suisou-button
          data-suisou-layout="grow"
          aria-pressed={lrigActive}
          onclick={() => handleMenuClick('lrigClass')}
        >
          <LrigClassIcon filled={isLrigClassFilterEnabled} />
        </button>
        <button
          type="button"
          class="cell"
          data-suisou-button
          data-suisou-layout="grow"
          aria-pressed={tagActive}
          onclick={() => handleMenuClick('tag')}
        >
          {#if isTagFilterEnabled}<IconTagFilled />{:else}<IconTag />{/if}
        </button>
      </div>
    </div>

    <div data-suisou-layout="row stretch" class="bar">
      <div data-suisou-layout="grow row gap-0" style="--suisou-grow: 5" data-suisou-tray>
        {#each [['白', 'c-white'], ['赤', 'c-red'], ['青', 'c-blue'], ['緑', 'c-green'], ['黒', 'c-black']] as [color, colorClass] (color)}
          <button
            type="button"
            class="cell"
            data-suisou-button
            data-suisou-layout="grow"
            aria-pressed={filter.selectedColors.has(color)}
            onclick={() => filter.toggleColor(color)}
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
    </div>
    <div data-suisou-layout="row stretch" class="bar">
      <div data-suisou-layout="grow row gap-0" style="--suisou-grow: 3" data-suisou-tray>
        {#each [1, 2, 3] as level (level)}
          <button
            type="button"
            class="cell"
            data-suisou-button
            data-suisou-layout="grow"
            aria-pressed={filter.selectedLevels.has(level)}
            onclick={() => filter.toggleLevel(level)}
          >
            {#if level === 1}
              {#if filter.selectedLevels.has(1)}
                <IconHexagonNumber1Filled />
              {:else}
                <IconHexagonNumber1 />
              {/if}
            {:else if level === 2}
              {#if filter.selectedLevels.has(2)}
                <IconHexagonNumber2Filled />
              {:else}
                <IconHexagonNumber2 />
              {/if}
            {:else}
              {#if filter.selectedLevels.has(3)}
                <IconHexagonNumber3Filled />
              {:else}
                <IconHexagonNumber3 />
              {/if}
            {/if}
          </button>
        {/each}
      </div>

      <button
        type="button"
        class="cell sq"
        data-suisou-button="outline"
        aria-pressed={filter.lifeBurstFilter !== null}
        onclick={filter.toggleLifeBurst}
      >
        {#if filter.lifeBurstFilter === false}<IconCircleXFilled />{:else}<LifeBurstIcon />{/if}
      </button>
    </div>

    <div data-suisou-layout="row stretch" class="bar">
      <div class="anchor sq">
        <button
          type="button"
          class="cell fill-w"
          data-suisou-button="outline"
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
          {settings}
        />
      </div>

      <div class="search" data-suisou-layout="grow" data-suisou-item="field">
        <div class="anchor sq-lg">
          <button
            type="button"
            class="cell fill-w"
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
            searchCardName={filter.searchName}
            searchCardText={filter.searchInText}
            onToggleSearchCardName={filter.toggleSearchName}
            onToggleSearchCardText={filter.toggleSearchInText}
          />
        </div>
        <input type="text" bind:value={searchText} oninput={handleSearchInput} />
        <button type="button" class="cell clear" data-suisou-button onclick={handleClear}>
          <IconCircleX />
        </button>
      </div>

      <button
        type="button"
        class="cell sq"
        data-suisou-button="outline"
        onclick={handleReset}
      >
        <IconLoader />
      </button>
    </div>
  </div>
</div>

<style>
  .pane {
    padding-inline: var(--suisou-space-2);
    padding-block-end: var(--suisou-space-3);
  }
  @media (min-width: 768px) {
    .pane {
      padding-block-end: var(--suisou-space-1);
    }
  }

  .fill {
    width: 100%;
    aspect-ratio: 63 / 88;
    min-height: 0;
    overflow: hidden;
  }
  .preview-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .menu-head {
    margin-block-end: var(--suisou-space-3);
  }

  .bar {
    height: 2.5rem;
  }
  @media (min-width: 1024px) {
    .bar {
      height: 2rem;
    }
  }

  .sq {
    width: 2.5rem;
  }
  .sq-lg {
    width: 3rem;
  }
  .anchor {
    position: relative;
  }
  .fill-w {
    width: 100%;
    height: 100%;
  }

  .ext-menu {
    flex: 1 1 0;
    min-height: 0;
  }
  .ext-menu > :global(.scroll) {
    flex: 1 1 0;
    min-height: 0;
    max-height: none;
  }



  .cell {
    padding: 0;
  }

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

  .search {
    display: flex;
    align-items: center;
  }
  .clear {
    flex: none;
    width: 3rem;
  }
</style>
