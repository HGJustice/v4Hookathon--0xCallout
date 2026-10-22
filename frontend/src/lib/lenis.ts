import type Lenis from "lenis";

// The page's Lenis instance, so components (e.g. modals) can pause smooth scrolling.
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;
