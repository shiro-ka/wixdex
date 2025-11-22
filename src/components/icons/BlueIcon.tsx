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
      {/* 外側の円（上部が開いている） */}
      <path d="M12 4 A8 8 0 0 1 20 12 A8 8 0 0 1 12 20 A8 8 0 0 1 4 12 A8 8 0 0 1 10 4.5" />
      {/* キーホールの円 */}
      <circle cx="12" cy="10" r="2" />
      {/* キーホールの台形 */}
      <path d="M10.5 12 L9.5 16 L14.5 16 L13.5 12 Z" />
    </svg>
  );
}
