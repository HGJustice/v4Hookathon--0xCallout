import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// The marketing pages (the home page) have their own navbar and end with the site footer.
// App pages such as /markets live in the (app) group, with a sidebar instead.
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
