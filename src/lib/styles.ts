import { cva } from 'class-variance-authority';

// Sidebar のメニュー/アクションボタン
export const sidebarBtn = cva(
  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
  {
    variants: {
      variant: {
        menu:   'text-white',
        action: 'bg-zinc-800/50 hover:bg-zinc-800 text-white text-sm',
        muted:  'bg-zinc-800/50 hover:bg-zinc-800 text-gray-400 hover:text-white text-sm',
      },
      disabled: {
        true:  'opacity-40 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'menu',
      disabled: false,
    },
  }
);

// SearchArea のフィルタートグルボタン（選択中/非選択の背景）
export const filterToggle = cva(
  'group flex items-center justify-center cursor-pointer transition-all',
  {
    variants: {
      active: {
        true:  'bg-zinc-500/30',
        false: 'bg-zinc-600/10',
      },
    },
    defaultVariants: { active: false },
  }
);

// SearchArea のフィルターアイコン色（選択中/非選択）
export const filterIcon = cva('w-5 h-5 transition-all', {
  variants: {
    active: {
      true:  'text-gray-300',
      false: 'text-gray-400 group-hover:text-gray-300',
    },
  },
  defaultVariants: { active: false },
});

// Navbar のアイコンボタン
export const navBtn = cva(
  'flex items-center justify-center transition-colors',
  {
    variants: {
      interactive: {
        true:  'group',
        false: 'cursor-not-allowed opacity-40',
      },
    },
    defaultVariants: { interactive: true },
  }
);

// 繰り返し使う静的なクラス断片
export const filterBorder = 'rounded-lg border border-gray-600/50';
export const filterGroup = 'rounded-lg border border-gray-600/50 overflow-hidden';
