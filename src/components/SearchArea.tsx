import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XCircleIcon,
  FolderIcon
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
import SettingsPopup from './SettingsPopup';

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
    <div className='flex-shrink-0 px-2 pb-4'>
      {/* ホバープレビュー - - - - - - - - - - - - */}
      <div className='hidden sm:block w-full 2xl:h-132 border border-neutral-700 rounded-xl p-4'>
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
      {/* 検索欄 - - - - - - - - - - - - - - - - - */}
      <div className="flex flex-1 flex-col">
        {/* 候補カード/カードタイプ/カード種類 */}
        <div className="flex w-full h-8 mb-2">
          <div
            className={`flex w-10 rounded-md mr-2 items-center justify-center cursor-pointer transition-all ${favoriteFilter
              ? 'bg-zinc-600/40 border-2 border-gray-500/50'
              : 'bg-gray-600/10 border-2 border-transparent'
              }`}
            onClick={onFavoriteFilter}
          >
            {favoriteFilter ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
              </svg>
            )}
          </div>
          <div
            id="folder-button"
            className={`flex flex-1 rounded-md mr-2 items-center justify-center cursor-pointer transition-all duration-200 ${candidateFilter
              ? 'bg-zinc-600/40 border-2 border-gray-500/50'
              : 'bg-gray-600/10 border-2 border-gray-600/40'
              }`}
            style={{ transition: 'all 0.2s ease-out' }}
            onClick={onCandidateFilter}
          >
            <FolderIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div
            className={`flex w-10 rounded-md mr-2 items-center justify-center cursor-pointer transition-all ${isTypeDropdownActive
              ? 'bg-zinc-600/40 border-2 border-gray-500/50'
              : 'bg-gray-600/10 border-2 border-transparent'
              }`}
            onClick={() => toggleDropdown('type')}
          >
            <CardTypeIcon filled={isTypeFilterEnabled} className="w-5 h-5 text-gray-400" />
          </div>
          <div
            className={`flex w-10 rounded-md mr-2 items-center justify-center cursor-pointer transition-all ${isLrigClassDropdownActive
              ? 'bg-zinc-600/40 border-2 border-gray-500/50'
              : 'bg-gray-600/10 border-2 border-transparent'
              }`}
            onClick={() => toggleDropdown('lrigClass')}
          >
            <LrigClassIcon filled={isLrigClassFilterEnabled} className="w-5 h-5 text-gray-400" />
          </div>
          <div
            className={`flex w-10 rounded-md items-center justify-center cursor-pointer transition-all ${isTagDropdownActive
              ? 'bg-zinc-600/40 border-2 border-gray-500/50'
              : 'bg-gray-600/10 border-2 border-transparent'
              }`}
            onClick={() => toggleDropdown('tag')}
          >
            {isTagFilterEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M11.172 2a3 3 0 0 1 2.121 .879l7.71 7.71a3.41 3.41 0 0 1 0 4.822l-5.592 5.592a3.41 3.41 0 0 1 -4.822 0l-7.71 -7.71a3 3 0 0 1 -.879 -2.121v-5.172a4 4 0 0 1 4 -4zm-3.672 3.5a2 2 0 0 0 -1.995 1.85l-.005 .15a2 2 0 1 0 2 -2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
              </svg>
            )}
          </div>
        </div>
        {/* 色/Lv/LB */}
        <div className="flex w-full h-8 mb-2">
          <div
            className={`flex flex-1 bg-zinc-600/10 rounded-l items-center justify-center cursor-pointer border ${selectedColors.has('白') ? 'border-yellow-100/30' : 'border-transparent'
              }`}
            onClick={() => onColorFilter('白')}
          >
            <WhiteIcon className="w-5 h-5 text-yellow-200" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 items-center justify-center cursor-pointer border ${selectedColors.has('赤') ? 'border-red-300/30' : 'border-transparent'
              }`}
            onClick={() => onColorFilter('赤')}
          >
            <RedIcon className="w-5 h-5 text-red-500" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 items-center justify-center cursor-pointer border ${selectedColors.has('青') ? 'border-blue-500/30' : 'border-transparent'
              }`}
            onClick={() => onColorFilter('青')}
          >
            <BlueIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 items-center justify-center cursor-pointer border ${selectedColors.has('緑') ? 'border-green-300/30' : 'border-transparent'
              }`}
            onClick={() => onColorFilter('緑')}
          >
            <GreenIcon className="w-5 h-5 text-green-500" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 rounded-r mr-2 items-center justify-center cursor-pointer border ${selectedColors.has('黒') ? 'border-purple-500/30' : 'border-transparent'
              }`}
            onClick={() => onColorFilter('黒')}
          >
            <BlackIcon className="w-5 h-5 text-purple-500" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 rounded-l items-center justify-center cursor-pointer border ${selectedLevels.has(1) ? 'border-gray-300/30' : 'border-transparent'
              }`}
            onClick={() => onLevelFilter(1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-5 h-5 text-gray-400">
              <path d="M144,48V208a8,8,0,0,1-16,0V62.13L100.12,78.86a8,8,0,1,1-8.24-13.72l40-24A8,8,0,0,1,144,48Z"></path>
            </svg>
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 items-center justify-center cursor-pointer border ${selectedLevels.has(2) ? 'border-gray-300/30' : 'border-transparent'
              }`}
            onClick={() => onLevelFilter(2)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-5 h-5 text-gray-400">
              <path d="M176,208a8,8,0,0,1-8,8H88a8,8,0,0,1-6.4-12.8l71.94-95.92a32,32,0,1,0-51.1-38.53,32.5,32.5,0,0,0-3.78,6.46A8,8,0,1,1,84,68.8a48,48,0,1,1,82.33,48.09L104,200h64A8,8,0,0,1,176,208Z"></path>
            </svg>
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 rounded-r mr-2 items-center justify-center cursor-pointer border ${selectedLevels.has(3) ? 'border-gray-300/30' : 'border-transparent'
              }`}
            onClick={() => onLevelFilter(3)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-5 h-5 text-gray-400">
              <path d="M176,160a56,56,0,0,1-93.33,41.74,8,8,0,1,1,10.66-11.92A40,40,0,1,0,120,120a8,8,0,0,1-6.4-12.8L152,56H88a8,8,0,0,1,0-16h80a8,8,0,0,1,6.4,12.8l-39.84,53.12A56.1,56.1,0,0,1,176,160Z"></path>
            </svg>
          </div>
          <div
            className={`flex w-10 bg-zinc-600/10 rounded-lg items-center justify-center cursor-pointer ${lifeBurstFilter === true ? 'border-2 border-gray-300/30' :
              lifeBurstFilter === false ? 'border-2 border-dashed border-gray-300/30' :
                'border-2 border-transparent'
              }`}
            onClick={onLifeBurstFilter}
          >
            <LifeBurstIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        {/* テキスト/クリア/その他ボタン */}
        <div className="flex w-full h-8">
          <div className='relative flex w-10 mr-2 bg-zinc-600/10 rounded-lg items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all' onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
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
          <div className="flex flex-1 mr-2 items-center bg-zinc-600/10 rounded-lg focus-within:ring-2 focus-within:ring-gray-500">
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
            className="flex w-10 aspect-square bg-zinc-600/10 rounded-lg items-center justify-center text-gray-400 hover:text-white cursor-pointer"
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
