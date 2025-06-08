import { MagnifyingGlassIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';
import iconWhite from '../assets/icon_color/icon_white_stroke.png';
import iconRed from '../assets/icon_color/icon_red_stroke.png';
import iconBlue from '../assets/icon_color/icon_blue_stroke.png';
import iconGreen from '../assets/icon_color/icon_green_stroke.png';
import iconBlack from '../assets/icon_color/icon_black_stroke.png';
import iconLevel1 from '../assets/icon_level/icon_lv1_stroke.png';
import iconLevel2 from '../assets/icon_level/icon_lv2_stroke.png';
import iconLevel3 from '../assets/icon_level/icon_lv3_stroke.png';
import iconLB from '../assets/icon_lb/icon_lb_stroke.png';

function SearchArea({ hoveredCard, onColorFilter, onTextSearch, onLevelFilter, onLifeBurstFilter, onReset, basePath }) {
  const inputRef = useRef(null);

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      onTextSearch('');
    }
  };

  const handleReset = () => {
    // テキスト検索をクリア
    handleClear();
    // すべての検索条件をリセット
    onReset();
  };

  return (
    <div className='flex flex-col w-full md:w-48 2xl:w-96 gap-4'>
      <div className='w-full 2xl:h-132 border border-neutral-700 rounded-xl p-4'>
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
      <div className="flex flex-col md:grow gap-4">
        <div className="flex w-full 2xl:h-12 border border-neutral-700 rounded-xl">
          <div className='h-full w-16 flex items-center justify-center'>
            <MagnifyingGlassIcon className="w-6 h-6"/>
          </div>
          <div className="w-px my-2 bg-neutral-700"></div>
          <div className="relative w-full h-full">
            <input
              ref={inputRef}
              type="text"
              placeholder="テキストで検索..."
              className="w-full h-full pl-4 pr-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => onTextSearch(e.target.value)}
            />
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              onClick={handleClear}
            >
              <XCircleIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="flex w-full 2xl:h-12 border border-neutral-700 rounded-xl">
          <div className="flex flex-1 items-center justify-center cursor-pointer" onClick={() => onColorFilter('白')}>
            <img src={iconWhite} alt="白" className="w-6 h-6" />
          </div>
          <div className="w-px my-2 bg-neutral-700"></div>
          <div className="flex flex-1 items-center justify-center cursor-pointer" onClick={() => onColorFilter('赤')}>
            <img src={iconRed} alt="赤" className="w-6 h-6" />
          </div>
          <div className="w-px my-2 bg-neutral-700"></div>
          <div className="flex flex-1 items-center justify-center cursor-pointer" onClick={() => onColorFilter('青')}>
            <img src={iconBlue} alt="青" className="w-6 h-6" />
          </div>
          <div className="w-px my-2 bg-neutral-700"></div>
          <div className="flex flex-1 items-center justify-center cursor-pointer" onClick={() => onColorFilter('緑')}>
            <img src={iconGreen} alt="緑" className="w-6 h-6" />
          </div>
          <div className="w-px my-2 bg-neutral-700"></div>
          <div className="flex flex-1 items-center justify-center cursor-pointer" onClick={() => onColorFilter('黒')}>
            <img src={iconBlack} alt="黒" className="w-6 h-6" />
          </div>
        </div>
        <div className='flex w-full 2xl:h-12 gap-4'>
          <div className="flex flex-3 border border-neutral-700 rounded-xl">
            <div className="flex flex-1 items-center justify-center cursor-pointer" onClick={() => onLevelFilter(1)}>
              <img src={iconLevel1} alt="１" className="w-6 h-6" />
            </div>
            <div className="w-px my-2 bg-neutral-700"></div>
            <div className="flex flex-1 items-center justify-center cursor-pointer" onClick={() => onLevelFilter(2)}>
              <img src={iconLevel2} alt="２" className="w-6 h-6" />
            </div>
            <div className="w-px my-2 bg-neutral-700"></div>
            <div className="flex flex-1 items-center justify-center cursor-pointer" onClick={() => onLevelFilter(3)}>
              <img src={iconLevel3} alt="３" className="w-6 h-6" />
            </div>
          </div>
          <div className="flex flex-1 border border-neutral-700 rounded-xl cursor-pointer" onClick={onLifeBurstFilter}>
            <div className="flex flex-1 items-center justify-center">
              <img src={iconLB} alt="LB" className="w-6 h-6" />
            </div>
          </div>
          <div className="flex flex-1 border border-neutral-700 rounded-xl items-center justify-center cursor-pointer" onClick={handleReset}>
            <XMarkIcon className="w-6 h-6"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchArea; 