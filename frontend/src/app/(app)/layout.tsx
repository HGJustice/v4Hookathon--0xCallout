import type { ReactNode } from "react";
import AppShell from "@/components/app/AppShell";

// Every app page (markets, creating one) sits in the sidebar frame. The landing page lives
// outside this group and keeps its own navbar and footer.
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
