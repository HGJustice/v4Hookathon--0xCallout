import Link from "next/link";
import Notice from "@/components/markets/Notice";

// Shown for an address that can't be a market, such as /markets/abc.
export default function MarketNotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="surface-nebula flex-1 px-5 pt-28 pb-24 sm:px-10 sm:pt-32 2xl:px-0">
        <div className="mx-auto max-w-[720px]">
          <Notice title="That's not a market">
            <p>
              The address doesn&apos;t point at a market.{" "}
              <Link href="/markets" className="text-white underline underline-offset-4 hover:text-brand">
                See all markets
              </Link>
            </p>
          </Notice>
        </div>
      </section>
    </main>
  );
}
