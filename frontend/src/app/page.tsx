import Benefits from "@/components/Benefits";
import Explore from "@/components/Explore";
import Faq from "@/components/Faq";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import MarketTicker from "@/components/MarketTicker";

export default function Home() {
  return (
    <main>
      <MarketTicker />
      <Hero />
      <Explore />
      <HowItWorks />
      <Benefits />
      <Faq />
    </main>
  );
}
