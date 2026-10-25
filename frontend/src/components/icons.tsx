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
