interface TypeFilterContentProps {
  selectedTypes: Set<string>;
  onToggle: (type: string) => void;
}

function TypeFilterContent({ selectedTypes, onToggle }: TypeFilterContentProps) {
  const CheckboxIcon = ({ checked }: { checked: boolean }) => {
    if (checked) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 text-orange-400 group-hover:text-orange-300 flex-shrink-0 transition-colors">
          <path fill="currentColor" d="M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0zM342 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L189.1 315.2 137 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.9 7.5 18.8 7s13.4-4.1 17.5-9.8L347.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z"/>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0 transition-colors">
        <path fill="currentColor" d="M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0zM64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zm230.7 89.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L211.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z"/>
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* ルリグデッキ */}
      <label className="group flex items-center space-x-2 text-white cursor-pointer" onClick={() => onToggle('ルリグ')}>
        <CheckboxIcon checked={selectedTypes.has('ルリグ')} />
        <span className="text-sm">ルリグ（センター）</span>
      </label>
      <label className="group flex items-center space-x-2 text-white cursor-pointer" onClick={() => onToggle('アシスト')}>
        <CheckboxIcon checked={selectedTypes.has('アシスト')} />
        <span className="text-sm">アシストルリグ</span>
      </label>
      <label className="group flex items-center space-x-2 text-white cursor-pointer" onClick={() => onToggle('ピース')}>
        <CheckboxIcon checked={selectedTypes.has('ピース')} />
        <span className="text-sm">ピース</span>
      </label>
      <label className="group flex items-center space-x-2 text-white cursor-pointer" onClick={() => onToggle('アーツ')}>
        <CheckboxIcon checked={selectedTypes.has('アーツ')} />
        <span className="text-sm">アーツ</span>
      </label>
      {/* メインデッキ */}
      <label className="group flex items-center space-x-2 text-white cursor-pointer" onClick={() => onToggle('シグニ')}>
        <CheckboxIcon checked={selectedTypes.has('シグニ')} />
        <span className="text-sm">シグニ</span>
      </label>
      <label className="group flex items-center space-x-2 text-white cursor-pointer" onClick={() => onToggle('スペル')}>
        <CheckboxIcon checked={selectedTypes.has('スペル')} />
        <span className="text-sm">スペル</span>
      </label>
    </div>
  );
}

export default TypeFilterContent;
