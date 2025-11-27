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
import SearchSettingsPopup from './SearchSettingsPopup';
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
  const [isSearchSettingsOpen, setIsSearchSettingsOpen] = useState(false);
  const [searchCardName, setSearchCardName] = useState(true);
  const [searchCardText, setSearchCardText] = useState(false);
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

  const isTypeFilterEnabled = selectedCardTypes.size > 0;
  const isLrigClassFilterEnabled = selectedLrigClasses.size > 0;
  const isTagFilterEnabled = selectedTags.size > 0;

  return (
    <div className='flex flex-col px-2 pb-4 md:pb-1 md:w-96'>
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
            className={`group flex md:flex-1 items-center justify-center w-10 h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all ${favoriteFilter ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
            onClick={onFavoriteFilter}
          >
            <StarIcon
              filled={favoriteFilter}
              className={`w-5 h-5 transition-all ${favoriteFilter ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                }`}
            />
          </div>
          <div
            id="folder-button"
            className={`group flex flex-1 items-center justify-center h-full mr-2 rounded-lg border border-gray-600/50 cursor-pointer transition-all ${candidateFilter ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
              }`}
            onClick={onCandidateFilter}
          >
            {candidateFilter ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-300 transition-all"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M9 3a1 1 0 0 1 .608 .206l.1 .087l2.706 2.707h6.586a3 3 0 0 1 2.995 2.824l.005 .176v8a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-11a3 3 0 0 1 2.824 -2.995l.176 -.005h4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
              </svg>
            )}
          </div>
          <div className="flex w-fit md:flex-3 rounded-lg border border-gray-600/50 overflow-hidden">
            <div
              className={`group flex flex-1 items-center justify-center w-10 h-full cursor-pointer transition-all ${activeDropdown === 'type' || expandedMenu === 'type' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
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
                className={`w-5 h-5 transition-all ${activeDropdown === 'type' || expandedMenu === 'type' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
              />
            </div>
            <div
              className={`group flex flex-1 items-center justify-center w-10 h-full cursor-pointer transition-all ${activeDropdown === 'lrigClass' || expandedMenu === 'lrigClass' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
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
                className={`w-5 h-5 transition-all ${activeDropdown === 'lrigClass' || expandedMenu === 'lrigClass' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
              />
            </div>
            <div
              className={`group flex flex-1 items-center justify-center w-10 h-full cursor-pointer transition-all ${activeDropdown === 'tag' || expandedMenu === 'tag' ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
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
                  className={`w-5 h-5 transition-all ${activeDropdown === 'tag' || expandedMenu === 'tag' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-5 h-5 transition-all ${activeDropdown === 'tag' || expandedMenu === 'tag' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                  <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
                </svg>
              )}
            </div>
          </div>
        </div>
        {/* 色/Lv/LB */}
        <div className="flex w-full h-8 mb-2">
          {/* 色検索 */}
          <div className="flex flex-5 mr-2 rounded-lg border border-gray-600/50 overflow-hidden">
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${selectedColors.has('白') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
                }`}
              onClick={() => onColorFilter('白')}
            >
              <WhiteIcon
                className={`w-5 h-5 transition-all ${selectedColors.has('白') ? 'text-yellow-100' : 'text-yellow-200'
                  }`}
              />
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${selectedColors.has('赤') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
                }`}
              onClick={() => onColorFilter('赤')}
            >
              <RedIcon
                className={`w-5 h-5 transition-all ${selectedColors.has('赤') ? 'text-red-400' : 'text-red-400'
                  }`}
              />
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${selectedColors.has('青') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
                }`}
              onClick={() => onColorFilter('青')}
            >
              <BlueIcon
                className={`w-5 h-5 transition-all ${selectedColors.has('青') ? 'text-blue-400' : 'text-blue-400'
                  }`}
              />
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${selectedColors.has('緑') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
                }`}
              onClick={() => onColorFilter('緑')}
            >
              <GreenIcon
                className={`w-5 h-5 transition-all ${selectedColors.has('緑') ? 'text-green-400' : 'text-green-400'
                  }`}
              />
            </div>
            <div
              className={`flex flex-1 items-center justify-center cursor-pointer transition-all ${selectedColors.has('黒') ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
                }`}
              onClick={() => onColorFilter('黒')}
            >
              <BlackIcon
                className={`w-5 h-5 transition-all ${selectedColors.has('黒') ? 'text-purple-400' : 'text-purple-500'
                  }`}
              />
            </div>
          </div>
          {/* レベル検索 */}
          <div className="flex flex-3 mr-2 rounded-lg border border-gray-600/50 overflow-hidden">
            <div
              className={`group flex flex-1 items-center justify-center cursor-pointer transition-all ${selectedLevels.has(1) ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
                }`}
              onClick={() => onLevelFilter(1)}
            >
              {selectedLevels.has(1) ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-gray-300 transition-all"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10.425 1.414a3.33 3.33 0 0 1 3.216 0l6.775 3.995c.067 .04 .127 .084 .18 .133l.008 .007l.107 .076a3.223 3.223 0 0 1 1.284 2.39l.005 .203v7.284c0 1.175 -.643 2.256 -1.623 2.793l-6.804 4.302c-.98 .538 -2.166 .538 -3.2 -.032l-6.695 -4.237a3.226 3.226 0 0 1 -1.678 -2.826v-7.285a3.21 3.21 0 0 1 1.65 -2.808zm.952 5.803l-.084 .076l-2 2l-.083 .094a1 1 0 0 0 0 1.226l.083 .094l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l.293 -.293v5.586l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-8l-.006 -.114c-.083 -.777 -1.008 -1.16 -1.617 -.67z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                  <path d="M10 10l2 -2v8" />
                </svg>
              )}
            </div>
            <div
              className={`group flex flex-1 items-center justify-center cursor-pointer transition-all ${selectedLevels.has(2) ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
                }`}
              onClick={() => onLevelFilter(2)}
            >
              {selectedLevels.has(2) ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-gray-300 transition-all"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10.425 1.414a3.33 3.33 0 0 1 3.216 0l6.775 3.995c.067 .04 .127 .084 .18 .133l.008 .007l.107 .076a3.223 3.223 0 0 1 1.284 2.39l.005 .203v7.284c0 1.175 -.643 2.256 -1.623 2.793l-6.804 4.302c-.98 .538 -2.166 .538 -3.2 -.032l-6.695 -4.237a3.226 3.226 0 0 1 -1.678 -2.826v-7.285a3.21 3.21 0 0 1 1.65 -2.808zm2.575 5.586h-3l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h3v2h-2l-.15 .005a2 2 0 0 0 -1.844 1.838l-.006 .157v2l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h3l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007h-3v-2h2l.15 -.005a2 2 0 0 0 1.844 -1.838l.006 -.157v-2l-.005 -.15a2 2 0 0 0 -1.838 -1.844l-.157 -.006z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                  <path d="M10 8h3a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3" />
                </svg>
              )}
            </div>
            <div
              className={`group flex flex-1 items-center justify-center cursor-pointer transition-all ${selectedLevels.has(3) ? 'bg-zinc-500/30' : 'bg-zinc-600/10'
                }`}
              onClick={() => onLevelFilter(3)}
            >
              {selectedLevels.has(3) ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-gray-300 transition-all"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10.425 1.414a3.33 3.33 0 0 1 3.216 0l6.775 3.995c.067 .04 .127 .084 .18 .133l.008 .007l.107 .076a3.223 3.223 0 0 1 1.284 2.39l.005 .203v7.284c0 1.175 -.643 2.256 -1.623 2.793l-6.804 4.302c-.98 .538 -2.166 .538 -3.2 -.032l-6.695 -4.237a3.226 3.226 0 0 1 -1.678 -2.826v-7.285a3.21 3.21 0 0 1 1.65 -2.808zm2.575 5.586h-2l-.15 .005a2 2 0 0 0 -1.85 1.995a1 1 0 0 0 1.974 .23l.02 -.113l.006 -.117h2v2h-2l-.133 .007c-1.111 .12 -1.154 1.73 -.128 1.965l.128 .021l.133 .007h2v2h-2l-.007 -.117a1 1 0 0 0 -1.993 .117a2 2 0 0 0 1.85 1.995l.15 .005h2l.15 -.005a2 2 0 0 0 1.844 -1.838l.006 -.157v-2l-.005 -.15a1.988 1.988 0 0 0 -.17 -.667l-.075 -.152l-.019 -.032l.02 -.03a2.01 2.01 0 0 0 .242 -.795l.007 -.174v-2l-.005 -.15a2 2 0 0 0 -1.838 -1.844l-.157 -.006z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                  <path d="M10 9a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1" />
                </svg>
              )}
            </div>
          </div>

          {/* LB検索 */}
          <div
            className={`group flex items-center justify-center w-10 h-full rounded-lg border border-gray-600/50 cursor-pointer transition-all ${lifeBurstFilter === true
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
                className={`w-5 h-5 transition-all ${lifeBurstFilter === true ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M4 6l8 0" />
              <path d="M16 6l4 0" />
              <path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M4 12l2 0" />
              <path d="M10 12l10 0" />
              <path d="M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M4 18l11 0" />
              <path d="M19 18l1 0" />
            </svg>
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
              className="relative flex w-12 h-full items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all"
              onClick={() => setIsSearchSettingsOpen(!isSearchSettingsOpen)}
            >
              {isSearchSettingsOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-300">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M14 3.072a8 8 0 0 1 2.32 11.834l5.387 5.387a1 1 0 0 1 -1.414 1.414l-5.388 -5.387a8 8 0 0 1 -12.905 -6.32l.005 -.285a8 8 0 0 1 11.995 -6.643m-5.293 4.22a1 1 0 0 0 -1.414 1.415l1.292 1.293l-1.292 1.293a1 1 0 0 0 1.414 1.414l1.293 -1.292l1.293 1.292a1 1 0 0 0 1.414 -1.414l-1.292 -1.293l1.292 -1.293a1 1 0 1 0 -1.414 -1.414l-1.293 1.292z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                  <path d="M21 21l-6 -6" />
                </svg>
              )}
              <SearchSettingsPopup
                isOpen={isSearchSettingsOpen}
                onClose={() => setIsSearchSettingsOpen(false)}
                searchCardName={searchCardName}
                searchCardText={searchCardText}
                onToggleSearchCardName={() => setSearchCardName(!searchCardName)}
                onToggleSearchCardText={() => setSearchCardText(!searchCardText)}
              />
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                <path d="M10 10l4 4m0 -4l-4 4" />
              </svg>
            </div>
          </div>
          <div
            className="flex w-10 aspect-square bg-zinc-600/10 border border-gray-600/50 rounded-lg items-center justify-center text-gray-400 hover:text-white cursor-pointer"
            onClick={handleReset}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 6l0 -3" />
              <path d="M16.25 7.75l2.15 -2.15" />
              <path d="M18 12l3 0" />
              <path d="M16.25 16.25l2.15 2.15" />
              <path d="M12 18l0 3" />
              <path d="M7.75 16.25l-2.15 2.15" />
              <path d="M6 12l-3 0" />
              <path d="M7.75 7.75l-2.15 -2.15" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchArea;
