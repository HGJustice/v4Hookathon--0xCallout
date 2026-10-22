"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PrivyProvider, useModalStatus } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getLenis } from "@/lib/lenis";
import { privyAppId, privyConfig } from "@/lib/privy";
import { wagmiConfig } from "@/lib/wagmi";
import FarcasterMiniApp from "./FarcasterMiniApp";

/**
 * Sign-in and wallets (Privy), wallet state (wagmi) and query caching for everything inside.
 * Order matters: Privy → React Query → wagmi. Without a Privy app id the site still renders,
 * and ConnectWalletButton shows sign-in as unavailable.
 */
export default function WalletProviders({ children }: { children: ReactNode }) {
  // One client per browser session; created lazily so it isn't shared across requests.
  const [queryClient] = useState(() => new QueryClient());

  if (!privyAppId) return children;

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <PauseSmoothScrollWhileModalOpen />
          <FarcasterMiniApp />
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

// Lenis drives the page scroll from the mouse wheel, so pause it while Privy's modal is
// open; otherwise scrolling inside the modal would also scroll the page behind it.
function PauseSmoothScrollWhileModalOpen() {
  const { isOpen } = useModalStatus();

  useEffect(() => {
    if (!isOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    return () => lenis?.start();
  }, [isOpen]);

  return null;
}
