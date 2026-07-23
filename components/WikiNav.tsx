"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: Array<{
  href: string;
  label: string;
  isActive: (path: string) => boolean;
}> = [
  {
    href: "/wiki",
    label: "Overview",
    isActive: (p) => p === "/wiki",
  },
  {
    href: "/wiki/factions",
    label: "Factions",
    isActive: (p) => p.startsWith("/wiki/faction"),
  },
  {
    href: "/wiki/units",
    label: "Units",
    isActive: (p) => p.startsWith("/wiki/unit"),
  },
  {
    href: "/wiki/buildings",
    label: "Buildings",
    isActive: (p) => p.startsWith("/wiki/building"),
  },
  {
    href: "/wiki/abilities",
    label: "Abilities",
    isActive: (p) => p.startsWith("/wiki/abilities"),
  },
  {
    href: "/wiki/researches",
    label: "Researches",
    isActive: (p) => p.startsWith("/wiki/researches"),
  },
  {
    href: "/wiki/shop",
    label: "Shop",
    isActive: (p) => p.startsWith("/wiki/shop"),
  },
  {
    href: "/wiki/matrix",
    label: "Damage Matrix",
    isActive: (p) => p.startsWith("/wiki/matrix"),
  },
  {
    href: "/wiki/statuses",
    label: "Statuses",
    isActive: (p) => p.startsWith("/wiki/statuses"),
  },
];

/** Secondary nav for the wiki section: sticky under the header, scrolls
 *  horizontally on narrow screens instead of wrapping. */
export default function WikiNav() {
  const pathname = usePathname() || "/wiki";
  return (
    <div className="sticky top-14 z-30 border-b border-bh-rule bg-bh-night/90 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 flex gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const active = t.isActive(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "border-bh-blood text-bh-ink"
                  : "border-transparent text-bh-mute hover:text-bh-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
