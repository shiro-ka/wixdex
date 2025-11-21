import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XCircleIcon,
  FolderIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';
import type { Card } from '../types';
import iconWhite from '../assets/icon_color/icon_white_stroke.png';
import iconRed from '../assets/icon_color/icon_red_stroke.png';
import iconBlue from '../assets/icon_color/icon_blue_stroke.png';
import iconGreen from '../assets/icon_color/icon_green_stroke.png';
import iconBlack from '../assets/icon_color/icon_black_stroke.png';
import iconLevel1 from '../assets/icon_level/icon_lv1_stroke.png';
import iconLevel2 from '../assets/icon_level/icon_lv2_stroke.png';
import iconLevel3 from '../assets/icon_level/icon_lv3_stroke.png';
import iconLB from '../assets/icon_lb/icon_lb_stroke.png';
import FilterDropdown from './dropdowns/FilterDropdown';
import TypeFilterContent from './dropdowns/TypeFilterContent';
import LrigClassFilterContent from './dropdowns/LrigClassFilterContent';

interface SearchAreaProps {
  hoveredCard: Card | null;
  selectedColors: Set<string>;
  selectedLevels: Set<number>;
  selectedCardTypes: Set<string>;
  selectedLrigClasses: Set<string>;
  lifeBurstFilter: boolean | null;
  onColorFilter: (color: string) => void;
  onTextSearch: (text: string) => void;
  onLevelFilter: (level: number) => void;
  onLifeBurstFilter: () => void;
  onCardTypeFilter: (type: string) => void;
  onLrigClassFilter: (lrigClass: string) => void;
  onReset: () => void;
  basePath: string;
}

function SearchArea({
  hoveredCard,
  onColorFilter,
  onTextSearch,
  onLevelFilter,
  onLifeBurstFilter,
  onCardTypeFilter,
  onLrigClassFilter,
  onReset,
  basePath,
  selectedColors,
  selectedLevels,
  selectedCardTypes,
  selectedLrigClasses,
  lifeBurstFilter,
}: SearchAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'lrigClass' | null>(null);

  const handleClear = () => {
    setSearchText('');
    onTextSearch('');
  };

  const handleReset = () => {
    handleClear();
    onReset();
  };

  const toggleDropdown = (dropdownName: 'type' | 'lrigClass') => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isTypeFilterActive = selectedCardTypes.size > 0 || activeDropdown === 'type';
  const isLrigClassFilterActive = selectedLrigClasses.size > 0 || activeDropdown === 'lrigClass';

  return (
    <div className='flex-shrink-0 px-2 pb-4'>
      {/* Type検索ドロップダウン */}
      <FilterDropdown
        isOpen={activeDropdown === 'type'}
        onClose={() => setActiveDropdown(null)}
        title="カードタイプ検索"
      >
        <TypeFilterContent
          selectedTypes={selectedCardTypes}
          onToggle={onCardTypeFilter}
        />
      </FilterDropdown>

      {/* LrigClass検索ドロップダウン */}
      <FilterDropdown
        isOpen={activeDropdown === 'lrigClass'}
        onClose={() => setActiveDropdown(null)}
        title="ルリグタイプ/クラス検索"
      >
        <LrigClassFilterContent
          selectedLrigClasses={selectedLrigClasses}
          onToggle={onLrigClassFilter}
        />
      </FilterDropdown>
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
          <div className="flex flex-1 border-2 border-gray-600/40 rounded-md mr-2 items-center justify-center cursor-pointer">
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
            <img src={iconWhite} alt="白" className="w-5 h-5" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 items-center justify-center cursor-pointer border ${selectedColors.has('赤') ? 'border-red-300/30' : 'border-transparent'
              }`}
            onClick={() => onColorFilter('赤')}
          >
            <img src={iconRed} alt="赤" className="w-5 h-5" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 items-center justify-center cursor-pointer border ${selectedColors.has('青') ? 'border-blue-500/30' : 'border-transparent'
              }`}
            onClick={() => onColorFilter('青')}
          >
            <img src={iconBlue} alt="青" className="w-5 h-5" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 items-center justify-center cursor-pointer border ${selectedColors.has('緑') ? 'border-green-300/30' : 'border-transparent'
              }`}
            onClick={() => onColorFilter('緑')}
          >
            <img src={iconGreen} alt="緑" className="w-5 h-5" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 rounded-r mr-2 items-center justify-center cursor-pointer border ${selectedColors.has('黒') ? 'border-purple-500/30' : 'border-transparent'
              }`}
            onClick={() => onColorFilter('黒')}
          >
            <img src={iconBlack} alt="黒" className="w-5 h-5" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 rounded-l items-center justify-center cursor-pointer border ${selectedLevels.has(1) ? 'border-gray-300/30' : 'border-transparent'
              }`}
            onClick={() => onLevelFilter(1)}
          >
            <img src={iconLevel1} alt="1" className="w-4 h-4" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 items-center justify-center cursor-pointer border ${selectedLevels.has(2) ? 'border-gray-300/30' : 'border-transparent'
              }`}
            onClick={() => onLevelFilter(2)}
          >
            <img src={iconLevel2} alt="2" className="w-4 h-4" />
          </div>
          <div
            className={`flex flex-1 bg-zinc-600/10 rounded-r mr-2 items-center justify-center cursor-pointer border ${selectedLevels.has(3) ? 'border-gray-300/30' : 'border-transparent'
              }`}
            onClick={() => onLevelFilter(3)}
          >
            <img src={iconLevel3} alt="3" className="w-4 h-4" />
          </div>
          <div
            className={`flex w-10 bg-zinc-600/10 rounded-lg items-center justify-center cursor-pointer ${lifeBurstFilter === true ? 'border-2 border-gray-300/30' :
              lifeBurstFilter === false ? 'border-2 border-dashed border-gray-300/30' :
                'border-2 border-transparent'
              }`}
            onClick={onLifeBurstFilter}
          >
            <img src={iconLB} alt="LB" className="w-4 h-4" />
          </div>
        </div>
        {/* テキスト/クリア/その他ボタン */}
        <div className="flex w-full h-8">
          <div className='flex w-10 mr-2 bg-zinc-600/10 rounded-lg items-center justify-center text-gray-400 hover:text-white cursor-pointer'>
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-1 px-2 mr-2 bg-zinc-600/10 rounded-lg focus-within:ring-2 focus-within:ring-gray-500">
            <div
              className="flex w-8 items-center justify-center text-gray-400 hover:text-white cursor-pointer rounded-full transition-all"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="#Text"
              className="w-full rounded-full ml-1 text-white placeholder-gray-400 focus:outline-none bg-transparent"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                onTextSearch(e.target.value);
              }}
            />
            <div
              className="flex w-8 items-center justify-center text-gray-400 hover:text-white cursor-pointer rounded-full transition-all"
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
              <path d="M12 2v4"/>
              <path d="m16.2 7.8 2.9-2.9"/>
              <path d="M18 12h4"/>
              <path d="m16.2 16.2 2.9 2.9"/>
              <path d="M12 18v4"/>
              <path d="m4.9 19.1 2.9-2.9"/>
              <path d="M2 12h4"/>
              <path d="m4.9 4.9 2.9 2.9"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchArea;
