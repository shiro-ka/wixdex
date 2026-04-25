<script lang="ts">
  import CheckboxIcon from '../icons/CheckboxIcon.svelte';

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
</script>

<div class="max-h-[48dvh] overflow-y-auto">
  <div class="grid grid-cols-3 gap-2">
    {#each lrigClasses as lrigClass (lrigClass)}
      {@const checked = selectedLrigClasses.has(lrigClass)}
      <button type="button" class="group flex items-center space-x-2 text-white cursor-pointer" onclick={() => onToggle(lrigClass)}>
        <CheckboxIcon
          {checked}
          class="w-5 h-5 flex-shrink-0 transition-colors {checked ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-300'}"
        />
        <span class="text-sm">{lrigClass}</span>
      </button>
    {/each}
  </div>
</div>
