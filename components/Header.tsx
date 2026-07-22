"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { STEAM_URL } from "@/lib/links";

const LINKS = [
  { href: "/", label: "About" },
  { href: "/how-to-play", label: "How to Play" },
  { href: "/wiki", label: "Wiki" },
  { href: "/devlog", label: "Devlog" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-bh-rule bg-bh-night/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 font-display text-lg tracking-wide text-bh-ink"
        >
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <span className="whitespace-nowrap">
            Bloodlust <span className="text-bh-blood">&amp;</span> Harmony
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-bh-mute hover:text-bh-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={STEAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-bh-blood px-3 py-1.5 font-medium text-white hover:bg-bh-bloodInk transition-colors"
          >
            Wishlist on Steam
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="md:hidden rounded border border-bh-rule px-3 py-1.5 text-sm text-bh-ink"
        >
          Menu
        </button>
      </div>

      {/* Mobile menu panel */}
      {open ? (
        <nav className="md:hidden border-t border-bh-rule bg-bh-night px-4 py-3 flex flex-col text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2.5 text-bh-mute hover:text-bh-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={STEAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 mb-1 rounded bg-bh-blood px-3 py-2.5 text-center font-medium text-white hover:bg-bh-bloodInk transition-colors"
          >
            Wishlist on Steam
          </a>
        </nav>
      ) : null}
    </header>
  );
}
