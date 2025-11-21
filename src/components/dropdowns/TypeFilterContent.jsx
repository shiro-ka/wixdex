/**
 * カードタイプフィルターの中身
 *
 * @param {Set} selectedTypes - 選択されているカードタイプのSet
 * @param {function} onToggle - カードタイプのトグル関数
 */
function TypeFilterContent({ selectedTypes, onToggle }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* ルリグデッキ */}
      <label className="flex items-center space-x-2 text-white cursor-pointer">
        <input
          type="checkbox"
          checked={selectedTypes.has('ルリグ')}
          onChange={() => onToggle('ルリグ')}
          className="w-4 h-4 rounded border-gray-600 bg-zinc-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm">ルリグ（センター）</span>
      </label>
      <label className="flex items-center space-x-2 text-white cursor-pointer">
        <input
          type="checkbox"
          checked={selectedTypes.has('アシスト')}
          onChange={() => onToggle('アシスト')}
          className="w-4 h-4 rounded border-gray-600 bg-zinc-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm">アシストルリグ</span>
      </label>
      <label className="flex items-center space-x-2 text-white cursor-pointer">
        <input
          type="checkbox"
          checked={selectedTypes.has('ピース')}
          onChange={() => onToggle('ピース')}
          className="w-4 h-4 rounded border-gray-600 bg-zinc-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm">ピース</span>
      </label>
      <label className="flex items-center space-x-2 text-white cursor-pointer">
        <input
          type="checkbox"
          checked={selectedTypes.has('アーツ')}
          onChange={() => onToggle('アーツ')}
          className="w-4 h-4 rounded border-gray-600 bg-zinc-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm">アーツ</span>
      </label>
      {/* メインデッキ */}
      <label className="flex items-center space-x-2 text-white cursor-pointer">
        <input
          type="checkbox"
          checked={selectedTypes.has('シグニ')}
          onChange={() => onToggle('シグニ')}
          className="w-4 h-4 rounded border-gray-600 bg-zinc-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm">シグニ</span>
      </label>
      <label className="flex items-center space-x-2 text-white cursor-pointer">
        <input
          type="checkbox"
          checked={selectedTypes.has('スペル')}
          onChange={() => onToggle('スペル')}
          className="w-4 h-4 rounded border-gray-600 bg-zinc-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm">スペル</span>
      </label>
    </div>
  );
}

export default TypeFilterContent;