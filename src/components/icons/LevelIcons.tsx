interface IconProps {
  className?: string;
}

// レベル1アイコン
export function Level1Icon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 外側の円 */}
      <circle cx="12" cy="12" r="10" />
      {/* 数字の1 */}
      <path d="M11 7 L12 7 L12 17" strokeWidth="3" />
      <line x1="10" y1="17" x2="14" y2="17" strokeWidth="2" />
    </svg>
  );
}

// レベル2アイコン
export function Level2Icon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 外側の円 */}
      <circle cx="12" cy="12" r="10" />
      {/* 数字の2 */}
      <path d="M9 9 Q9 7 11 7 Q13 7 13 9 Q13 11 9 15 L9 17 L15 17" strokeWidth="2" fill="none" />
    </svg>
  );
}

// レベル3アイコン
export function Level3Icon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 外側の円 */}
      <circle cx="12" cy="12" r="10" />
      {/* 数字の3 */}
      <path d="M9 8 Q9 7 11 7 Q13 7 13 9 Q13 11 12 11.5 Q13 12 13 14 Q13 17 11 17 Q9 17 9 16" strokeWidth="2" fill="none" />
    </svg>
  );
}
