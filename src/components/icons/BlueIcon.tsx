interface BlueIconProps {
  className?: string;
}

export function BlueIcon({ className = "w-5 h-5" }: BlueIconProps) {
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
      {/* 外側の円 */}
      <circle cx="12" cy="12" r="10" />
      {/* 内側の円 */}
      <circle cx="12" cy="12" r="4" />
      {/* 線 */}
      <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="15" x2="16" y2="19" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="15" x2="8" y2="19" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
