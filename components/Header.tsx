import Image from "next/image";
import Link from "next/link";
import { STEAM_URL } from "@/lib/links";

export default function Header() {
  return (
    <header className="border-b border-bh-rule bg-bh-night/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg tracking-wide text-bh-ink"
        >
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <span>
            Bloodlust <span className="text-bh-blood">&amp;</span> Harmony
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/wiki" className="text-bh-mute hover:text-bh-ink transition-colors">
            Wiki
          </Link>
          <Link
            href="/wiki/units"
            className="text-bh-mute hover:text-bh-ink transition-colors"
          >
            Units
          </Link>
          <Link
            href="/wiki/buildings"
            className="text-bh-mute hover:text-bh-ink transition-colors"
          >
            Buildings
          </Link>
          <Link
            href="/wiki/abilities"
            className="text-bh-mute hover:text-bh-ink transition-colors"
          >
            Abilities
          </Link>
          <Link
            href="/wiki/matrix"
            className="text-bh-mute hover:text-bh-ink transition-colors"
          >
            Matrix
          </Link>
          <Link
            href="/wiki/statuses"
            className="text-bh-mute hover:text-bh-ink transition-colors"
          >
            Statuses
          </Link>
          <Link
            href="/devlog"
            className="text-bh-mute hover:text-bh-ink transition-colors"
          >
            Devlog
          </Link>
          <a
            href={STEAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-bh-blood px-3 py-1.5 font-medium text-white hover:bg-bh-bloodInk transition-colors"
          >
            Wishlist on Steam
          </a>
        </nav>
      </div>
    </header>
  );
}
