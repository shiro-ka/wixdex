<script lang="ts">
  import FilterChecklist from './FilterChecklist.svelte';

  interface Props {
    selectedLrigClasses: Set<string>;
    onToggle: (lrigClass: string) => void;
  }
  let { selectedLrigClasses, onToggle }: Props = $props();

  const lrigClasses = [
    'タマ', '花代', 'ユヅキ', '緑子', 'エルドラ', 'アン', 'イオナ', 'ウリス', 'ハナレ',
    'リル', 'メル', 'ナナシ', 'あや', 'ドーナ', 'ママ', 'グズ子', 'ミルルン', 'レイラ', 'カーニバル', '夢限',
    'ピルルク', 'リメンバ', 'アルフォウ',
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
    '龍獣', '水獣', '空獣', '地獣', '凶蟲', '精元',
  ];
  const items = lrigClasses.map((c) => ({ value: c, label: c }));
</script>

<FilterChecklist {items} selected={selectedLrigClasses} {onToggle} columns={3} />
