import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';
import type { Card } from '../types';
import { WhiteIcon } from './icons/WhiteIcon';
import { RedIcon } from './icons/RedIcon';
import { BlueIcon } from './icons/BlueIcon';
import { GreenIcon } from './icons/GreenIcon';
import { BlackIcon } from './icons/BlackIcon';
import { LifeBurstIcon } from './icons/LifeBurstIcon';
import { CardTypeIcon } from './icons/CardTypeIcon';
import { LrigClassIcon } from './icons/LrigClassIcon';
import { StarIcon } from './icons/StarIcon';
import SettingsPopup from './SettingsPopup';
import TypeFilterContent from './dropdowns/TypeFilterContent';
import LrigClassFilterContent from './dropdowns/LrigClassFilterContent';
import TagFilterContent from './dropdowns/TagFilterContent';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface SearchAreaProps {
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
  onReset: () => void;
  basePath: string;
  activeDropdown: 'type' | 'lrigClass' | 'tag' | null;
  onDropdownChange: (dropdown: 'type' | 'lrigClass' | 'tag' | null) => void;
  showLifeBurst: boolean;
  onToggleLifeBurst: () => void;
  showCandidateIcon: boolean;
  onToggleCandidateIcon: () => void;
}

function SearchArea({
  hoveredCard,
  onColorFilter,
  onTextSearch,
  onLevelFilter,
  onLifeBurstFilter,
  onCardTypeFilter,
  onLrigClassFilter,
  onTagFilter,
  onCandidateFilter,
  onFavoriteFilter,
  onReset,
  basePath,
  selectedColors,
  selectedLevels,
  selectedCardTypes,
  selectedLrigClasses,
  selectedTags,
  lifeBurstFilter,
  candidateFilter,
  favoriteFilter,
  activeDropdown,
  onDropdownChange,
  showLifeBurst,
  onToggleLifeBurst,
  showCandidateIcon,
  onToggleCandidateIcon,
}: SearchAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<'type' | 'lrigClass' | 'tag' | null>('type');

  // lg以上（1024px以上）かどうかを判定
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  const handleClear = () => {
    setSearchText('');
    onTextSearch('');
  };

  const handleReset = () => {
    handleClear();
    onReset();
  };

  const toggleDropdown = (dropdownName: 'type' | 'lrigClass' | 'tag') => {
    onDropdownChange(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isTypeDropdownActive = activeDropdown === 'type';
  const isLrigClassDropdownActive = activeDropdown === 'lrigClass';
  const isTagDropdownActive = activeDropdown === 'tag';

  const isTypeFilterEnabled = selectedCardTypes.size > 0;
  const isLrigClassFilterEnabled = selectedLrigClasses.size > 0;
  const isTagFilterEnabled = selectedTags.size > 0;

  return (
    <div className='flex flex-col px-2 pb-4 md:pb-0 md:w-96'>
      {/* ホバープレビュー */}
      <div className='hidden lg:block w-full aspect-[3/4] p-4 mb-2 bg-gray-600/10 rounded-xl'>
        {hoveredCard && (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={`${basePath}/assets/cards_img/${hoveredCard.image}`}
              className="max-w-full max-h-full object-contain"
              alt={hoveredCard.name}
            />
          </div>
        )}
      </div>
      {/* 拡張メニュー */}
      <div className='hidden lg:flex flex-1 flex-col mb-2 bg-gray-600/10 border border-gray-600/50 rounded-xl p-4 overflow-hidden'>
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base text-white">
            {expandedMenu === 'type' && 'カードタイプ検索'}
            {expandedMenu === 'lrigClass' && 'ルリグタイプ/クラス検索'}
            {expandedMenu === 'tag' && 'タグ検索'}
          </h3>
          <button
            onClick={() => {
              if (expandedMenu === 'type') {
                selectedCardTypes.forEach(type => onCardTypeFilter(type));
              } else if (expandedMenu === 'lrigClass') {
                selectedLrigClasses.forEach(lrigClass => onLrigClassFilter(lrigClass));
              } else if (expandedMenu === 'tag') {
                selectedTags.forEach(tag => onTagFilter(tag));
              }
            }}
            className="text-gray-400 hover:text-white !bg-transparent hover:bg-gray-700/50 rounded-lg p-1 transition-all"
            aria-label="チェック全解除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M8.56 3.69a9 9 0 0 0 -2.92 1.95" />
              <path d="M3.69 8.56a9 9 0 0 0 -.69 3.44" />
              <path d="M3.69 15.44a9 9 0 0 0 1.95 2.92" />
              <path d="M8.56 20.31a9 9 0 0 0 3.44 .69" />
              <path d="M15.44 20.31a9 9 0 0 0 2.92 -1.95" />
              <path d="M20.31 15.44a9 9 0 0 0 .69 -3.44" />
              <path d="M20.31 8.56a9 9 0 0 0 -1.95 -2.92" />
              <path d="M15.44 3.69a9 9 0 0 0 -3.44 -.69" />
              <path d="M9 12l2 2l4 -4" />
            </svg>
          </button>
        </div>
        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {expandedMenu === 'type' && (
            <TypeFilterContent
              selectedTypes={selectedCardTypes}
              onToggle={onCardTypeFilter}
            />
          )}
          {expandedMenu === 'lrigClass' && (
            <LrigClassFilterContent
              selectedLrigClasses={selectedLrigClasses}
              onToggle={onLrigClassFilter}
            />
          )}
          {expandedMenu === 'tag' && (
            <TagFilterContent
              selectedTags={selectedTags}
              onToggle={onTagFilter}
            />
          )}
        </div>
      </div>
      {/* 検索欄 */}
      <div className="flex flex-col">
        {/* お気に入り/候補カード/カードタイプ/カード種類/タグ */}
        <div className="flex w-full h-8 mb-2">
          <div
            className={`flex items-center justify-center w-10 h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all ${
              favoriteFilter ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
            }`}
            onClick={onFavoriteFilter}
          >
            <StarIcon
              filled={favoriteFilter}
              className={`w-5 h-5 transition-all ${
                favoriteFilter ? 'text-gray-300' : 'text-gray-400'
              }`}
            />
          </div>
          <div
            id="folder-button"
            className={`flex flex-1 items-center justify-center h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all ${
              candidateFilter ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
            }`}
            onClick={onCandidateFilter}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-5 h-5 transition-all ${
                candidateFilter ? 'text-gray-300' : 'text-gray-400'
              }`}
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
            </svg>
          </div>
          <div
            className={`flex items-center justify-center w-10 h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all ${
              activeDropdown === 'type' || expandedMenu === 'type' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
            }`}
            onClick={() => {
              // lg未満ではドロップダウン、lg以上では拡張メニュー
              if (!isLargeScreen) {
                toggleDropdown('type');
              }
              setExpandedMenu('type');
            }}
          >
            <CardTypeIcon
              filled={isTypeFilterEnabled}
              className={`w-5 h-5 transition-all ${
                activeDropdown === 'type' || expandedMenu === 'type' ? 'text-gray-300' : 'text-gray-400'
              }`}
            />
          </div>
          <div
            className={`flex items-center justify-center w-10 h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all ${
              activeDropdown === 'lrigClass' || expandedMenu === 'lrigClass' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
            }`}
            onClick={() => {
              if (!isLargeScreen) {
                toggleDropdown('lrigClass');
              }
              setExpandedMenu('lrigClass');
            }}
          >
            <LrigClassIcon
              filled={isLrigClassFilterEnabled}
              className={`w-5 h-5 transition-all ${
                activeDropdown === 'lrigClass' || expandedMenu === 'lrigClass' ? 'text-gray-300' : 'text-gray-400'
              }`}
            />
          </div>
          <div
            className={`flex items-center justify-center w-10 h-full rounded-lg border border-gray-600/50 cursor-pointer transition-all ${
              activeDropdown === 'tag' || expandedMenu === 'tag' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
            }`}
            onClick={() => {
              if (!isLargeScreen) {
                toggleDropdown('tag');
              }
              setExpandedMenu('tag');
            }}
          >
            {isTagFilterEnabled ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-5 h-5 transition-all ${
                  activeDropdown === 'tag' || expandedMenu === 'tag' ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M11.172 2a3 3 0 0 1 2.121 .879l7.71 7.71a3.41 3.41 0 0 1 0 4.822l-5.592 5.592a3.41 3.41 0 0 1 -4.822 0l-7.71 -7.71a3 3 0 0 1 -.879 -2.121v-5.172a4 4 0 0 1 4 -4zm-3.672 3.5a2 2 0 0 0 -1.995 1.85l-.005 .15a2 2 0 1 0 2 -2" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-5 h-5 transition-all ${
                  activeDropdown === 'tag' || expandedMenu === 'tag' ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
              </svg>
            )}
          </div>
        </div>
        {/* 色/Lv/LB */}
        <div className="flex w-full h-8 mb-2">
          {/* 色検索 */}
          <div className="flex flex-5 mr-2 rounded-lg border border-gray-600/50 overflow-hidden">
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${
                selectedColors.has('白') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
              onClick={() => onColorFilter('白')}
            >
              <WhiteIcon
                className={`w-5 h-5 transition-all ${
                  selectedColors.has('白') ? 'text-yellow-100' : 'text-yellow-200'
                }`}
              />
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${
                selectedColors.has('赤') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
              onClick={() => onColorFilter('赤')}
            >
              <RedIcon
                className={`w-5 h-5 transition-all ${
                  selectedColors.has('赤') ? 'text-red-400' : 'text-red-500'
                }`}
              />
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${
                selectedColors.has('青') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
              onClick={() => onColorFilter('青')}
            >
              <BlueIcon
                className={`w-5 h-5 transition-all ${
                  selectedColors.has('青') ? 'text-blue-400' : 'text-blue-500'
                }`}
              />
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${
                selectedColors.has('緑') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
              onClick={() => onColorFilter('緑')}
            >
              <GreenIcon
                className={`w-5 h-5 transition-all ${
                  selectedColors.has('緑') ? 'text-green-400' : 'text-green-500'
                }`}
              />
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${
                selectedColors.has('黒') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
              onClick={() => onColorFilter('黒')}
            >
              <BlackIcon
                className={`w-5 h-5 transition-all ${
                  selectedColors.has('黒') ? 'text-purple-400' : 'text-purple-500'
                }`}
              />
            </div>
          </div>
          {/* レベル検索 */}
          <div className="flex flex-3 mr-2 rounded-lg border border-gray-600/50 overflow-hidden">
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${
                selectedLevels.has(1) ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
              onClick={() => onLevelFilter(1)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 256 256"
                className={`w-5 h-5 transition-all ${
                  selectedLevels.has(1) ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                <path d="M144,48V208a8,8,0,0,1-16,0V62.13L100.12,78.86a8,8,0,1,1-8.24-13.72l40-24A8,8,0,0,1,144,48Z"></path>
              </svg>
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${
                selectedLevels.has(2) ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
              onClick={() => onLevelFilter(2)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 256 256"
                className={`w-5 h-5 transition-all ${
                  selectedLevels.has(2) ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                <path d="M176,208a8,8,0,0,1-8,8H88a8,8,0,0,1-6.4-12.8l71.94-95.92a32,32,0,1,0-51.1-38.53,32.5,32.5,0,0,0-3.78,6.46A8,8,0,1,1,84,68.8a48,48,0,1,1,82.33,48.09L104,200h64A8,8,0,0,1,176,208Z"></path>
              </svg>
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${
                selectedLevels.has(3) ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
              onClick={() => onLevelFilter(3)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 256 256"
                className={`w-5 h-5 transition-all ${
                  selectedLevels.has(3) ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                <path d="M176,160a56,56,0,0,1-93.33,41.74,8,8,0,1,1,10.66-11.92A40,40,0,1,0,120,120a8,8,0,0,1-6.4-12.8L152,56H88a8,8,0,0,1,0-16h80a8,8,0,0,1,6.4,12.8l-39.84,53.12A56.1,56.1,0,0,1,176,160Z"></path>
              </svg>
            </div>
          </div>

          {/* LB検索 */}
          <div
            className={`flex items-center justify-center w-10 h-full rounded-lg border border-gray-600/50 cursor-pointer transition-all ${
              lifeBurstFilter === true
                ? 'bg-zinc-500/30'
                : lifeBurstFilter === false
                ? 'bg-zinc-500/30'
                : 'bg-zinc-600/10'
            }`}
            onClick={onLifeBurstFilter}
          >
            {lifeBurstFilter === false ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-300 transition-all"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 2l.642 .005l.616 .017l.299 .013l.579 .034l.553 .046c4.687 .455 6.65 2.333 7.166 6.906l.03 .29l.046 .553l.041 .727l.006 .15l.017 .617l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.455 4.687 -2.333 6.65 -6.906 7.166l-.29 .03l-.553 .046l-.727 .041l-.15 .006l-.617 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.687 -.455 -6.65 -2.333 -7.166 -6.906l-.03 -.29l-.046 -.553l-.041 -.727l-.006 -.15l-.017 -.617l-.004 -.318v-.648l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.455 -4.687 2.333 -6.65 6.906 -7.166l.29 -.03l.553 -.046l.727 -.041l.15 -.006l.617 -.017c.21 -.003 .424 -.005 .642 -.005zm-1.489 7.14a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z" />
              </svg>
            ) : (
              <LifeBurstIcon
                className={`w-5 h-5 transition-all ${
                  lifeBurstFilter === true ? 'text-gray-300' : 'text-gray-400'
                }`}
              />
            )}
          </div>
        </div>
        {/* テキスト/クリア/その他ボタン */}
        <div className="flex w-full h-8">
          <div
            className="relative flex items-center justify-center w-10 h-full mr-2 rounded-lg bg-zinc-600/10 border border-gray-600/50 text-gray-400 hover:text-white cursor-pointer transition-all"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <SettingsPopup
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              showLifeBurst={showLifeBurst}
              onToggleLifeBurst={onToggleLifeBurst}
              showCandidateIcon={showCandidateIcon}
              onToggleCandidateIcon={onToggleCandidateIcon}
            />
          </div>
          <div className="flex flex-1 mr-2 items-center bg-zinc-600/10 border border-gray-600/50 rounded-lg focus-within:ring-2 focus-within:ring-gray-500">
            <div
              className="flex w-12 h-full items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder=""
              className="w-full h-full pb-[2px] ml-2 text-sm text-white placeholder-gray-400 focus:outline-none bg-transparent"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                onTextSearch(e.target.value);
              }}
            />
            <div
              className="flex w-12 h-full items-center justify-center text-gray-400 hover:text-white cursor-pointer rounded-full transition-all"
              onClick={handleClear}
            >
              <XCircleIcon className="w-5 h-5" />
            </div>
          </div>
          <div
            className="flex w-10 aspect-square bg-zinc-600/10 border border-gray-600/50 rounded-lg items-center justify-center text-gray-400 hover:text-white cursor-pointer"
            onClick={handleReset}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M12 2v4" />
              <path d="m16.2 7.8 2.9-2.9" />
              <path d="M18 12h4" />
              <path d="m16.2 16.2 2.9 2.9" />
              <path d="M12 18v4" />
              <path d="m4.9 19.1 2.9-2.9" />
              <path d="M2 12h4" />
              <path d="m4.9 4.9 2.9 2.9" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchArea;
