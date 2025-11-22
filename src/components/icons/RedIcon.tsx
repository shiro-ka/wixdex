interface RedIconProps {
  className?: string;
}

export function RedIcon({ className = "w-5 h-5" }: RedIconProps) {
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
