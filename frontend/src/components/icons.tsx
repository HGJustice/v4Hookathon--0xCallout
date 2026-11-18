type Props = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ArrowRight = ({ className = "size-5" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Close = ({ className = "size-6" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Play = ({ className = "size-6" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
);

export const Copy = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </svg>
);

export const Check = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const ExternalLink = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

export const Key = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9M17 6l3 3" />
  </svg>
);

export const LogOut = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H4" />
  </svg>
);

export const Menu = ({ className = "size-5" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);

export const Clock = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const User = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

/** An Ethereum diamond: for amounts of ETH. */
export const Eth = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 2.5l6 9.5-6 3.5-6-3.5 6-9.5zM6 14.5l6 7 6-7" />
  </svg>
);

export const LinkIcon = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </svg>
);

export const ArrowUp = ({ className = "size-5" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const ArrowDown = ({ className = "size-5" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const Browse = ({ className = "size-5" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);

export const Plus = ({ className = "size-5" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const Moon = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
  </svg>
);

export const Sun = ({ className = "size-4" }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
