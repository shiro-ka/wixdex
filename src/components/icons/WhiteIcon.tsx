interface WhiteIconProps {
  className?: string;
}

export function WhiteIcon({ className = "w-5 h-5" }: WhiteIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* <path d="M12 2 L22 7 L18 19 L12 22 L6 19 L2 7 Z" /> */}
      <path d="M12 2 L21.5 6.5 Q22 7 21.8 8 L18 19 Q17.5 21 15.5 21.5 L12 23 L8.5 21.5 Q6.5 21 6 19 L2.2 8 Q2 7 2.5 6.5 Z" />
      <line x1="16" y1="5" x2="15" y2="22" stroke="currentColor" strokeWidth="1.2" />
      <line x1="7" y1="5" x2="9" y2="22" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
