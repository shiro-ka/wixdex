interface GreenIconProps {
  className?: string;
}

export function GreenIcon({ className = "w-5 h-5" }: GreenIconProps) {
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
