interface IconProps {
  className?: string;
}

// ライフバーストアイコン - 6方向の星型
export function LifeBurstIcon({ className = "w-4 h-4" }: IconProps) {
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
      {/* 6方向の星型アウトライン */}
      <path d="M12 2 L15 7 L22 7 L17 12 L22 17 L15 17 L12 22 L9 17 L2 17 L7 12 L2 7 L9 7 Z" />
      {/* 中央のX */}
      <line x1="8" y1="7" x2="16" y2="17" />
      <line x1="16" y1="7" x2="8" y2="17" />
    </svg>
  );
}
