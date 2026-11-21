"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ComponentType } from "react";
import { isBrowsing, isCreating } from "@/lib/nav";
import { Browse, Plus } from "../icons";
import { focusRing } from "../markets/styles";

type Item = { href: string; label: string; Icon: ComponentType<{ className?: string }>; current: (pathname: string) => boolean };

const ITEMS: readonly Item[] = [
  { href: "/markets", label: "Browse", Icon: Browse, current: isBrowsing },
  { href: "/markets/new", label: "Create market", Icon: Plus, current: isCreating },
];

type Variant = "sidebar" | "tabs";

/**
 * The app's links: a vertical list in the sidebar, or equal tabs in the phone's bottom bar.
 * The current page is marked from the pathname, which on routes like /markets/[id] isn't
 * known until the request, so it's read inside Suspense and the links render unmarked until then.
 */
export default function NavItems({ variant }: { variant: Variant }) {
  return (
    <Suspense fallback={<List variant={variant} pathname={null} />}>
      <CurrentList variant={variant} />
    </Suspense>
  );
}

function CurrentList({ variant }: { variant: Variant }) {
  return <List variant={variant} pathname={usePathname()} />;
}

const styles: Record<Variant, { list: string; link: string }> = {
  sidebar: {
    list: "space-y-1",
    link: "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] text-white/60 aria-[current=page]:bg-white/[0.07] aria-[current=page]:text-white",
  },
  tabs: {
    list: "flex",
    link: "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs text-white/60 aria-[current=page]:text-white",
  },
};

function List({ variant, pathname }: { variant: Variant; pathname: string | null }) {
  const { list, link } = styles[variant];
  return (
    <ul role="list" className={list}>
      {ITEMS.map(({ href, label, Icon, current }) => (
        <li key={href} className={variant === "tabs" ? "flex flex-1" : undefined}>
          <Link
            href={href}
            aria-current={pathname !== null && current(pathname) ? "page" : undefined}
            className={`${link} ${focusRing}`}
          >
            <Icon className={variant === "tabs" ? "size-6" : "size-5"} />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
