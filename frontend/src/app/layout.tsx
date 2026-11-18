import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, IBM_Plex_Mono, IBM_Plex_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import PageBackground from "@/components/PageBackground";
import SmoothScroll from "@/components/SmoothScroll";
import WalletProviders from "@/components/wallet/WalletProviders";

// Type roles (wired to Tailwind's font-display / font-sans / font-mono in globals.css).
// The landing page:
// - display: headlines and the wordmark. Its optical-size axis tightens large type.
// - text: body copy and UI.
// - mono: odds and prices, so digits line up.
const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz"] });
const text = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// The app pages are set like a newspaper (.theme-paper): a high-contrast Didone for headlines,
// and IBM Plex for everything else, with its mono for labels and figures.
const paperDisplay = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const paperText = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"] });
const paperMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });
const fonts = [display, text, mono, paperDisplay, paperText, paperMono].map((font) => font.variable).join(" ");

export const metadata: Metadata = {
  title: "0xCallOut",
  description: "Turn online arguments into prediction markets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fonts} h-full antialiased`}>
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
