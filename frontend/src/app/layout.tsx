import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import PageBackground from "@/components/PageBackground";
import SmoothScroll from "@/components/SmoothScroll";
import WalletProviders from "@/components/wallet/WalletProviders";

// Four type roles (wired to Tailwind's font-display / font-serif / font-sans / font-mono in globals.css):
// - display: headlines and the wordmark. Its optical-size axis tightens large type.
// - serif: market questions on cards, set like newspaper headlines in Playfair Display.
// - text: body copy and UI.
// - mono: odds and prices, so digits line up.
const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz"] });
const serif = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const text = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "0xCallOut",
  description: "Turn online arguments into prediction markets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${text.variable} ${mono.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col">
        <SmoothScroll />
        <PageBackground />
        <WalletProviders>
          {children}
        </WalletProviders>
      </body>
    </html>
  );
}
