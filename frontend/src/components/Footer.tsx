import Link from "next/link";
import { ArrowRight } from "./icons";

// Four-column footer, laid out like cian.app's. Links without a real page yet point
// to the closest section on the home page, or to "#" for external/legal pages.
const COLUMNS: [title: string, links: [label: string, href: string][]][] = [
  [
    "Product",
    [
      ["Create a market", "#how-it-works"],
      ["Explore markets", "#markets"],
      ["Leaderboard", "#markets"],
    ],
  ],
  [
    "Learn",
    [
      ["How it works", "#how-it-works"],
      ["Docs", "#faq"],
      ["FAQ", "#faq"],
    ],
  ],
  [
    "Community",
    [
      ["Farcaster", "#"],
      ["X", "#"],
      ["Telegram", "#"],
    ],
  ],
  [
    "Legal",
    [
      ["Terms", "#"],
      ["Privacy", "#"],
      ["Risk disclosure", "#"],
    ],
  ],
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black px-5 pt-20 text-white sm:px-10 2xl:px-0">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-14 xl:flex-row xl:justify-between">
          <div className="max-w-[360px]">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-medium">
              <span className="size-8 rounded-full bg-linear-to-br from-brand to-brand-soft" />
              Multiverse Markets
            </Link>
            <p className="mt-5 leading-7 text-white/60">
              Turn online arguments into prediction markets. Built on Uniswap V4, resolved by Chainlink CRE.
            </p>
            <a
              href="#how-it-works"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-soft px-6 text-black transition hover:brightness-110"
            >
              Launch App <ArrowRight />
            </a>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4 xl:gap-20">
            {COLUMNS.map(([title, links]) => (
              <div key={title}>
                <p className="text-sm text-white/40">{title}</p>
                <ul className="mt-5 space-y-3">
                  {links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="transition-colors hover:text-brand">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-white/10 py-8 text-sm text-white/40 sm:flex-row sm:justify-between">
          <p>© 2026 Multiverse Markets</p>
          <p>Prediction markets involve risk. Testnet demo.</p>
        </div>
      </div>

      {/* Large faint wordmark along the bottom edge */}
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[2vw] text-center text-[14vw] leading-[0.8] font-extralight tracking-tight text-white/[0.05] select-none"
      >
        Multiverse
      </p>
    </footer>
  );
}
