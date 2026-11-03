import Benefits from "@/components/Benefits";
import Explore from "@/components/Explore";
import Faq from "@/components/Faq";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";

export default function Home() {
  return (
    <main>
      <Hero />
      <Explore />
      <HowItWorks />
      <Benefits />
      <Faq />
    </main>
  );
}
