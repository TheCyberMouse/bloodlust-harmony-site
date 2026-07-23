import Link from "next/link";
import { GAME_MODES } from "@/lib/modes";

export const metadata = {
  title: "Game modes",
  description:
    "The five game modes in Bloodlust & Harmony: Regular, Ultimate, Draft, Poker, and Sandbox. How each one plays and when to pick it.",
  alternates: { canonical: "/wiki/modes" },
};

export default function ModesOverview() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">Game modes</h1>
      <p className="mt-2 max-w-prose text-bh-mute">
        Five ways to play, all chosen in the Create Server menu. Every mode
        works in Single Player and Multiplayer alike. Single Player is just a
        one-human lobby with AI filling the other seats.
      </p>

      <div className="mt-10 space-y-4">
        {GAME_MODES.map((mode) => (
          <Link
            key={mode.slug}
            href={`/wiki/modes/${mode.slug}`}
            className="group block rounded-lg border border-bh-rule bg-bh-panel p-5 hover:border-bh-blood transition-colors"
          >
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-2xl group-hover:text-bh-blood transition-colors">
                {mode.name}
              </h2>
              <span className="text-sm text-bh-mute">{mode.tagline}</span>
            </div>
            <p className="mt-2 text-bh-mute leading-relaxed">{mode.summary}</p>
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {[
                ["Players", mode.glance.players],
                ["Economy", mode.glance.economy],
                ["Buildings", mode.glance.buildings],
                ["Win", mode.glance.win],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-bh-mute">
                    {label}
                  </dt>
                  <dd className="text-bh-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Link>
        ))}
      </div>

      <div className="mt-12 max-w-prose rounded-lg border border-bh-rule bg-bh-panel p-6">
        <h2 className="font-display text-xl mb-3">Good to know</h2>
        <ul className="ml-5 list-disc space-y-2 text-bh-mute leading-relaxed">
          <li>
            Every non-Regular mode locks the race picker, since the faction is
            shared or unused. Poker and Sandbox go further and flatten the
            lobby into one free-for-all Players list.
          </li>
          <li>
            <strong className="text-bh-ink">
              Quickplay and ranked are always Regular.
            </strong>{" "}
            Game modes never affect your rank.
          </li>
        </ul>
      </div>
    </div>
  );
}
