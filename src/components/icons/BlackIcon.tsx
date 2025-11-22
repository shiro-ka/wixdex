interface BlackIconProps {
  className?: string;
}

export function BlackIcon({ className = "w-5 h-5" }: BlackIconProps) {
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
