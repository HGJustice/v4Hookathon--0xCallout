import Link from "next/link";
import Notice from "@/components/markets/Notice";

// Shown for an address that can't be a market, such as /markets/abc.
export default function MarketNotFound() {
  return (
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
  );
}
