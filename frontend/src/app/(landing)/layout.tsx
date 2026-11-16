import type { ReactNode } from "react";
import Footer from "@/components/Footer";

// The marketing pages (the home page) end with the site footer. App pages such as
// /markets live outside this group, so they don't.
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
