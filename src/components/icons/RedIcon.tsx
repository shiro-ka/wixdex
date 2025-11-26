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
      <path d="M12 2 L16 10 L22 9 L12 22 L2 9 L8 10 Z" />
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
