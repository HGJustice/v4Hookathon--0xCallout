import { ArrowRight } from "./icons";
import StatCard from "./StatCard";
import VideoPanel from "./VideoPanel";

export default function Hero() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 pt-28 sm:px-10 sm:pt-36 xl:px-0 xl:pt-[150px]">
      <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
        <div className="animate-fade-up">
          <h1 className="text-[40px] font-normal leading-[48px] sm:text-[60px] sm:leading-[68px]">
            {"DON'T JUST ARGUE."}
            <br />
            BET ON IT.
          </h1>
          <p className="mt-4 max-w-[600px] text-lg font-extralight text-white/80 sm:text-2xl">
            Tag the bot in any Farcaster argument. Both sides put money in, and
            everyone else can bet too.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#how-it-works"
              className="flex h-11 items-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-soft px-6 text-black transition hover:brightness-110"
            >
              Start a Market <ArrowRight />
            </a>
            <a
              href="#markets"
              className="steel-border steel-shine flex h-11 items-center rounded-full px-6 transition-colors hover:text-brand"
            >
              Explore Markets
            </a>
          </div>
        </div>
        <StatCard />
      </div>
      <VideoPanel />
    </section>
  );
}
