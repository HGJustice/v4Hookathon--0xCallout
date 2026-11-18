// Pill styles shared by the wallet button's states, matching the navbar's other pills.
// Colours and corners come from theme tokens, so in the newspaper theme they print square, in ink.
export const pill =
  "flex h-8 items-center gap-2 rounded-control px-4 text-sm transition sm:h-11 sm:px-6 sm:text-base";
export const primaryPill = `${pill} bg-linear-to-r from-brand to-brand-soft text-background hover:brightness-110`;
