import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import GridBackground from "@/components/GridBackground";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import WalletProviders from "@/components/wallet/WalletProviders";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multiverse Markets",
  description: "Turn online arguments into prediction markets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col">
        <SmoothScroll />
        <GridBackground />
        <WalletProviders>
          <Navbar />
          {children}
          <Footer />
        </WalletProviders>
      </body>
    </html>
  );
}
