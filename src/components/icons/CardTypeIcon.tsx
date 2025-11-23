interface CardTypeIconProps {
  className?: string;
  filled?: boolean;
}

export function CardTypeIcon({ className = "w-5 h-5", filled = false }: CardTypeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19 c0 0.552 0.448 1 1 1 h10.5 L22 5 c0 -0.552 -0.448 -1 -1 -1 H5 c-0.552 0 -1 0.448 -1 1 V19 Z" />
    </svg>
  );
}
