import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';
import iconWhite from '../assets/icon_color/icon_white_stroke.png';
import iconRed from '../assets/icon_color/icon_red_stroke.png';
import iconBlue from '../assets/icon_color/icon_blue_stroke.png';
import iconGreen from '../assets/icon_color/icon_green_stroke.png';
import iconBlack from '../assets/icon_color/icon_black_stroke.png';
import iconLevel1 from '../assets/icon_level/icon_lv1_stroke.png';
import iconLevel2 from '../assets/icon_level/icon_lv2_stroke.png';
import iconLevel3 from '../assets/icon_level/icon_lv3_stroke.png';
import iconLB from '../assets/icon_lb/icon_lb_stroke.png';

function SearchArea({ 
  hoveredCard, onColorFilter, onTextSearch, onLevelFilter, onLifeBurstFilter, onReset, basePath,
  selectedColors = new Set(),
  selectedLevels = new Set(),
  lifeBurstFilter = null,
}) {

  const inputRef = useRef(null);
  const [searchText, setSearchText] = useState('');

  const handleClear = () => {
    setSearchText('');
    onTextSearch('');
  };

  const handleReset = () => {
    handleClear();
    onReset();
  };

  return (
    <div className=''>
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
      <div className="">
        {/* 色/Lv/LB */}
        <div className="grid grid-cols-[2fr_2fr_2fr_2fr_2fr_1fr_2fr_2fr_2fr_1fr_2fr] gap-2 w-full mb-4">
          <div
            className={`flex h-8 aspect-1/1 rounded-full items-center justify-center cursor-pointer ${
              selectedColors.has('白') ? 'border border-yellow-100/30' : ''
            }`}
            onClick={() => onColorFilter('白')}
          >
            <img src={iconWhite} alt="白" className="w-5 h-5" />
          </div>
          <div
            className={`flex h-8 aspect-1/1 rounded-full items-center justify-center cursor-pointer ${
              selectedColors.has('赤') ? 'border border-red-300/30' : ''
            }`}
            onClick={() => onColorFilter('赤')}
          >
            <img src={iconRed} alt="赤" className="w-5 h-5" />
          </div>
          <div
            className={`flex h-8 aspect-1/1 rounded-full items-center justify-center cursor-pointer ${
              selectedColors.has('青') ? 'border border-blue-500/30' : ''
            }`}
            onClick={() => onColorFilter('青')}
          >
            <img src={iconBlue} alt="青" className="w-5 h-5" />
          </div>
          <div
            className={`flex h-8 aspect-1/1 rounded-full items-center justify-center cursor-pointer ${
              selectedColors.has('緑') ? 'border border-green-300/30' : ''
            }`}
            onClick={() => onColorFilter('緑')}
          >
            <img src={iconGreen} alt="緑" className="w-5 h-5" />
          </div>
          <div
            className={`flex h-8 aspect-1/1 rounded-full items-center justify-center cursor-pointer ${
              selectedColors.has('黒') ? 'border border-purple-500/30' : ''
            }`}
            onClick={() => onColorFilter('黒')}
          >
            <img src={iconBlack} alt="黒" className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-center">
            <div className="w-0.5 h-5 bg-neutral-600"></div>
          </div>
          <div
            className={`flex h-8 aspect-1/1 rounded-full items-center justify-center cursor-pointer ${
              selectedLevels.has(1) ? 'border border-gray-300/30' : ''
            }`}
            onClick={() => onLevelFilter(1)}
          >
            <img src={iconLevel1} alt="1" className="w-4 h-4" />
          </div>
          <div
            className={`flex h-8 aspect-1/1 rounded-full items-center justify-center cursor-pointer ${
              selectedLevels.has(2) ? 'border border-gray-300/30' : ''
            }`}
            onClick={() => onLevelFilter(2)}
          >
            <img src={iconLevel2} alt="2" className="w-4 h-4" />
          </div>
          <div
            className={`flex h-8 aspect-1/1 rounded-full items-center justify-center cursor-pointer ${
              selectedLevels.has(3) ? 'border border-gray-300/30' : ''
            }`}
            onClick={() => onLevelFilter(3)}
          >
            <img src={iconLevel3} alt="3" className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-center">
            <div className="w-0.5 h-5 bg-neutral-600"></div>
          </div>
          <div
            className={`flex h-8 aspect-1/1 rounded-full items-center justify-center cursor-pointer ${
              lifeBurstFilter ? 'border border-gray-300/30' : ''
            }`}
            onClick={onLifeBurstFilter}
          >
            <img src={iconLB} alt="LB" className="w-4 h-4" />
          </div>
        </div>
        {/* テキスト/クリア/その他ボタン */}
        <div className="flex w-full">
          <div className='flex h-10 aspect-square mr-2 bg-zinc-700/70 rounded-full items-center justify-center text-gray-400 hover:text-white cursor-pointer'>
            <MagnifyingGlassIcon className="w-5 h-5"/>
          </div>
          <div className="flex flex-1 mr-2 bg-zinc-700/70 rounded-full focus-within:ring-2 focus-within:ring-blue-500">
            <input
              ref={inputRef}
              type="text"
              placeholder="＃Text"
              className="flex-1 pl-4 pr-10 rounded-full text-white placeholder-gray-400 focus:outline-none bg-transparent"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                onTextSearch(e.target.value);
              }}
            />
            <div
              className="flex h-10 w-10 mr-2 items-center justify-center text-gray-400 hover:text-white cursor-pointer rounded-full transition-all"
              onClick={handleClear}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </div>
          </div>
          <div
            className="flex h-10 aspect-square bg-zinc-700/70 rounded-full items-center justify-center text-gray-400 hover:text-white cursor-pointer"
            onClick={handleReset}
          >
            <XMarkIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchArea;