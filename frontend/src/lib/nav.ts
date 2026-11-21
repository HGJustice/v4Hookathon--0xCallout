// Which sidebar link a path belongs to. Opening a market (/markets/[id]) keeps "Browse" lit,
// since that's where it came from; creating one is its own link.
export const isCreating = (pathname: string) => pathname === "/markets/new";
export const isBrowsing = (pathname: string) => pathname.startsWith("/markets") && !isCreating(pathname);
