/**
 * ルリグタイプ/クラスフィルターの中身
 *
 * @param {Set} selectedLrigClasses - 選択されているルリグタイプ/クラスのSet
 * @param {function} onToggle - ルリグタイプ/クラスのトグル関数
 */
function LrigClassFilterContent({ selectedLrigClasses, onToggle }) {
  const lrigClasses = [
    'タマ', '花代', 'ユヅキ', '緑子', 'エルドラ', 'アン', 'イオナ', 'ウリス', 'ハナレ',
    'リル', 'メル', 'ナナシ', 'あや', 'ドーナ', 'ママ', 'グズ子', 'ミルルン', 'レイラ', 'カーニバル', '夢限',
    'ピルルク', 'リメンバ',
    'アルフォウ',
    'サシェ', 'ミュウ', 'アイヤイ', 'ララ・ルー', 'ソウイ',
    'タウィル', 'ウムル', 'アト', 'ヤミノ',
    'ヒラナ', 'アキノ', 'レイ', 'LION', 'LOVIT', 'WOLF', 'タマゴ', 'ノヴァ', 'バン', 'ムジカ',
    'サンガ', 'マドカ', 'みこみこ', 'ゆかゆか', 'まほまほ', 'デウス', 'エクス', 'マキナ',
    'アザエラ', 'ミカエラ', 'ガブリエラ',
    'るう子', 'ひとえ', 'ちより', 'あきら',
    'リゼ', 'アンジュ', 'とこ', '美兎', 'アズサ', 'ネル', 'シロコ', 'ヒナ', 'ホシノ', 'サオリ',
    'ミヤコ', 'ユカリ', 'シュン',
    'アーム', 'ウェポン', 'トリック', '遊具', '毒牙', '迷宮', '乗機', '電機', '調理', '古代兵器',
    '天使', '武勇', '英知', '美巧', '悪魔', '宇宙', '鉱石', '宝石', '原子', '植物', '微菌', '怪異',
    '龍獣', '水獣', '空獣', '地獣', '凶蟲', '精元'
  ];

  return (
    <div className="max-h-[50dvh] overflow-y-auto">
      <div className="grid grid-cols-3 gap-2">
        {lrigClasses.map((lrigClass) => (
          <label
            key={lrigClass}
            className="flex items-center space-x-2 text-white cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedLrigClasses.has(lrigClass)}
              onChange={() => onToggle(lrigClass)}
              className="w-4 h-4 rounded border-gray-600 bg-zinc-700 text-blue-500 focus:ring-2 focus:ring-blue-500 flex-shrink-0"
            />
            <span className="text-sm">{lrigClass}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default LrigClassFilterContent;
