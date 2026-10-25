import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CosmicBackground from "@/components/CosmicBackground";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import WalletProviders from "@/components/wallet/WalletProviders";

// Three type roles (wired to Tailwind's font-display / font-sans / font-mono in globals.css):
// - display: headlines and the wordmark. Its optical-size axis tightens large type.
// - text: body copy and UI.
// - mono: odds and prices, so digits line up.
const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz"] });
const text = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multiverse Markets",
  description: "Turn online arguments into prediction markets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col">
        <SmoothScroll />
        <CosmicBackground />
        <WalletProviders>
          <Navbar />
          {children}
          <Footer />
        </WalletProviders>
      </body>
    </html>
  );
}
