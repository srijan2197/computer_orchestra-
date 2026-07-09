export default function MadBuddiesMascot({ className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>{`
        @keyframes glance {
          0%,100% { transform: translateX(0px); }
          20%      { transform: translateX(2.5px); }
          60%      { transform: translateX(-2.5px); }
        }
        .mascot-pupils { animation: glance 2.6s ease-in-out infinite; }
      `}</style>

      {/* Head */}
      <ellipse cx="32" cy="30" rx="18" ry="20" fill="#FBBF24" />

      {/* Hair */}
      <ellipse cx="32" cy="12" rx="18" ry="7" fill="#1e293b" />
      <rect x="14" y="10" width="36" height="8" rx="4" fill="#1e293b" />
      <polygon points="20,10 17,2 23,8" fill="#1e293b" />
      <polygon points="28,9 26,1 31,7" fill="#1e293b" />
      <polygon points="36,9 34,1 39,7" fill="#1e293b" />
      <polygon points="44,10 41,2 47,8" fill="#1e293b" />

      {/* Ears */}
      <ellipse cx="14" cy="30" rx="3" ry="4" fill="#FBBF24" />
      <ellipse cx="50" cy="30" rx="3" ry="4" fill="#FBBF24" />

      {/* Eye whites */}
      <rect x="16" y="24" width="12" height="9" rx="3" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="36" y="24" width="12" height="9" rx="3" fill="white" stroke="#1e293b" strokeWidth="1.5" />

      {/* Glasses bridge + arms */}
      <line x1="28" y1="28" x2="36" y2="28" stroke="#1e293b" strokeWidth="1.5" />
      <line x1="16" y1="28" x2="13" y2="27" stroke="#1e293b" strokeWidth="1.5" />
      <line x1="48" y1="28" x2="51" y2="27" stroke="#1e293b" strokeWidth="1.5" />

      {/* Animated pupils */}
      <g className="mascot-pupils">
        <circle cx="22" cy="28" r="2.5" fill="#1e293b" />
        <circle cx="42" cy="28" r="2.5" fill="#1e293b" />
        <circle cx="23" cy="27" r="0.8" fill="white" />
        <circle cx="43" cy="27" r="0.8" fill="white" />
      </g>

      {/* Eyebrows */}
      <path d="M16 22 Q22 19 28 22" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M36 22 Q42 19 48 22" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <ellipse cx="32" cy="36" rx="2" ry="1.2" fill="#f59e0b" />

      {/* Smile */}
      <path d="M25 42 Q32 47 39 42" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Body */}
      <path d="M18 48 Q32 44 46 48 L50 64 H14 Z" fill="#6366f1" />
      <path d="M26 48 L32 54 L38 48" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
