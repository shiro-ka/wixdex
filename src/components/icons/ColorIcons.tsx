interface IconProps {
  className?: string;
}

// 白（黄色）- 六角形の盾型
export function WhiteIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 中央の六角形 */}
      <path d="M12 3 L16 6 L16 12 L12 15 L8 12 L8 6 Z" />
      {/* 左のパネル */}
      <path d="M6 7 L4 8 L4 10 L6 9 Z" />
      {/* 右のパネル */}
      <path d="M18 7 L20 8 L20 10 L18 9 Z" />
    </svg>
  );
}

// 赤 - 下向き矢印
export function RedIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 中央の縦線 */}
      <path d="M10 4 L10 14" />
      <path d="M14 4 L14 14" />
      {/* 矢印の先端 */}
      <path d="M6 10 L12 20 L18 10" />
    </svg>
  );
}

// 青 - サークルとキーホール
export function BlueIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 外側の円（上部が開いている） */}
      <path d="M12 4 A8 8 0 0 1 20 12 A8 8 0 0 1 12 20 A8 8 0 0 1 4 12 A8 8 0 0 1 10 4.5" />
      {/* キーホールの円 */}
      <circle cx="12" cy="10" r="2" />
      {/* キーホールの台形 */}
      <path d="M10.5 12 L9.5 16 L14.5 16 L13.5 12 Z" />
    </svg>
  );
}

// 緑 - タワー型
export function GreenIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 上部の屋根 */}
      <path d="M12 4 L8 7 L16 7 Z" />
      {/* タワーの外形 */}
      <path d="M8 7 L7 20 L17 20 L16 7" />
      {/* 内部の縦線 */}
      <line x1="10" y1="9" x2="10" y2="20" />
      <line x1="12" y1="9" x2="12" y2="20" />
      <line x1="14" y1="9" x2="14" y2="20" />
    </svg>
  );
}

// 黒（紫）- 4方向の菱形
export function BlackIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 上の菱形 */}
      <path d="M12 4 L14 8 L12 12 L10 8 Z" />
      {/* 下の菱形 */}
      <path d="M12 12 L14 16 L12 20 L10 16 Z" />
      {/* 左の菱形 */}
      <path d="M4 12 L8 14 L12 12 L8 10 Z" />
      {/* 右の菱形 */}
      <path d="M12 12 L16 14 L20 12 L16 10 Z" />
    </svg>
  );
}
