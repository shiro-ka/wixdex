import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XCircleIcon,
  FolderIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';
import type { Card } from '../types';
import { WhiteIcon } from './icons/WhiteIcon';
import { RedIcon } from './icons/RedIcon';
import { BlueIcon } from './icons/BlueIcon';
import { GreenIcon } from './icons/GreenIcon';
import { BlackIcon } from './icons/BlackIcon';
import { LifeBurstIcon } from './icons/LifeBurstIcon';

interface SearchAreaProps {
  hoveredCard: Card | null;
  selectedColors: Set<string>;
  selectedLevels: Set<number>;
  selectedCardTypes: Set<string>;
  selectedLrigClasses: Set<string>;
  lifeBurstFilter: boolean | null;
  candidateFilter: boolean;
  onColorFilter: (color: string) => void;
  onTextSearch: (text: string) => void;
  onLevelFilter: (level: number) => void;
  onLifeBurstFilter: () => void;
  onCardTypeFilter: (type: string) => void;
  onLrigClassFilter: (lrigClass: string) => void;
  onCandidateFilter: () => void;
  onReset: () => void;
  basePath: string;
  activeDropdown: 'type' | 'lrigClass' | null;
  onDropdownChange: (dropdown: 'type' | 'lrigClass' | null) => void;
}

function SearchArea({
  hoveredCard,
  onColorFilter,
  onTextSearch,
  onLevelFilter,
  onLifeBurstFilter,
  onCardTypeFilter,
  onLrigClassFilter,
  onCandidateFilter,
  onReset,
  basePath,
  selectedColors,
  selectedLevels,
  selectedCardTypes,
  selectedLrigClasses,
  lifeBurstFilter,
  candidateFilter,
  activeDropdown,
  onDropdownChange,
}: SearchAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState('');

  const handleClear = () => {
    setSearchText('');
    onTextSearch('');
  };

  const handleReset = () => {
    handleClear();
    onReset();
  };

  const toggleDropdown = (dropdownName: 'type' | 'lrigClass') => {
    onDropdownChange(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isTypeFilterActive = selectedCardTypes.size > 0 || activeDropdown === 'type';
  const isLrigClassFilterActive = selectedLrigClasses.size > 0 || activeDropdown === 'lrigClass';

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
            id="folder-button"
            className={`flex flex-1 rounded-md mr-2 items-center justify-center cursor-pointer transition-all duration-200 ${candidateFilter
              ? 'bg-zinc-600/40 border-2 border-gray-500/50'
              : 'bg-gray-600/10 border-2 border-gray-600/40'
              }`}
            style={{ transition: 'all 0.2s ease-out' }}
            onClick={onCandidateFilter}
          >
            <FolderIcon className="w-5 h-5" />
          </div>
          <div
            className={`flex w-10 rounded-md mr-2 items-center justify-center cursor-pointer transition-all ${isTypeFilterActive
              ? 'bg-zinc-600/40 border-2 border-gray-500/50'
              : 'bg-gray-600/10 border-2 border-transparent'
              }`}
            onClick={() => toggleDropdown('type')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill={isTypeFilterActive ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h9.5L22 4.5H4V19.5Z" />
            </svg>
          </div>
          <div
            className={`flex w-10 rounded-md mr-2 items-center justify-center cursor-pointer transition-all ${isLrigClassFilterActive
              ? 'bg-zinc-600/40 border-2 border-gray-500/50'
              : 'bg-gray-600/10 border-2 border-transparent'
              }`}
            onClick={() => toggleDropdown('lrigClass')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill={isLrigClassFilterActive ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.42 4.83 3.046 11.205a1.125 1.125 0 0 0 0 1.59l6.374 6.375c.21.211.497.33.795.33H19.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25h-9.284c-.298 0-.585.119-.795.33Z" />
            </svg>
          </div>
          <div className="flex w-10 bg-gray-600/10 rounded-md items-center justify-center cursor-pointer">
            <TagIcon className="w-5 h-5" />
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
          <div className='flex w-10 mr-2 bg-zinc-600/10 rounded-lg items-center justify-center text-gray-400'>
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-1 mr-2 items-center bg-zinc-600/10 rounded-lg focus-within:ring-2 focus-within:ring-gray-500">
            <div
              className="flex w-12 h-full border-r items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all"
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
