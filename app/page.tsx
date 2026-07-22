import Link from "next/link";
import IconImg from "@/components/IconImg";
import Slideshow from "@/components/Slideshow";
import { DISCORD_URL, STEAM_URL } from "@/lib/links";
import { listScreenshots } from "@/lib/screenshots";
import { slugOf, unitsByFaction } from "@/lib/wiki";

export const revalidate = 3600;

export default async function Home() {
  const groups = await unitsByFaction();
  const races = groups.map((g) => g.race);
  const screenshots = listScreenshots();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-bh-mute mb-6">
          01 · An auto-battler RTS
        </p>
        <h1 className="font-display text-5xl sm:text-6xl leading-tight">
          Your army fights.
          <br />
          <span className="text-bh-blood">You build.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-prose text-lg text-bh-mute">
          Every building you place spawns soldiers that march on the enemy
          castle, wave after wave, all match long. Feed your bloodlust and every
          coin becomes swords at the front line. Keep your harmony and your
          economy compounds into an unstoppable late game. The last castle
          standing wins.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-bh-blood px-8 py-3 font-medium text-white hover:bg-bh-bloodInk transition-colors"
          >
            Join the Discord — play the alpha
          </a>
          <a
            href={STEAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-bh-rule px-6 py-3 font-medium text-bh-ink hover:border-bh-mute transition-colors"
          >
            Wishlist on Steam
          </a>
        </div>
        <p className="mt-5 text-sm text-bh-mute">
          Alpha testing is open by request. We are actively looking for players
          who want to shape the game. Ask in the Discord and we will get you in.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/wiki"
            className="text-bh-blood hover:text-bh-bloodInk transition-colors"
          >
            Browse the wiki →
          </Link>
        </p>
      </section>

      {/* Screenshots (appears once files land in public/screenshots) */}
      {screenshots.length > 0 ? (
        <>
          <hr className="border-bh-rule" />
          <section className="py-16">
            <p className="text-xs uppercase tracking-[0.3em] text-bh-mute mb-6">
              02 · From the battlefield
            </p>
            <Slideshow images={screenshots} />
          </section>
        </>
      ) : null}

      <hr className="border-bh-rule" />

      {/* How it plays */}
      <section className="py-20 grid gap-10 sm:grid-cols-3">
        {[
          {
            n: "03",
            title: "Build the engine",
            body: "Every 10 Gold spent on unit buildings becomes +1 Income, paid out every 30 seconds. Spending IS investing. Wood comes from growth; Stardust is precious.",
          },
          {
            n: "04",
            title: "Send the waves",
            body: "Every 60 seconds a wave spawns and marches. No unit micro: your build order is your strategy, and every building keeps contributing on its turn.",
          },
          {
            n: "05",
            title: "Win the matchup",
            body: "Attack and armor types, elements, immunities, stuns, auras, and stealth. Every enemy composition is a puzzle you answer at the build menu.",
          },
        ].map((c) => (
          <div key={c.n}>
            <p className="text-xs uppercase tracking-[0.3em] text-bh-mute mb-3">
              {c.n}
            </p>
            <h2 className="font-display text-xl mb-2">{c.title}</h2>
            <p className="text-sm text-bh-mute leading-relaxed">{c.body}</p>
          </div>
        ))}
      </section>

      <hr className="border-bh-rule" />

      {/* Factions */}
      <section className="py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-bh-mute mb-3">
          06 · Factions
        </p>
        <h2 className="font-display text-3xl mb-8">Pick your army</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {races.map((race) => (
            <Link
              key={race.id}
              href={`/wiki/faction/${slugOf(race.key)}`}
              className="group rounded-lg border border-bh-rule bg-bh-panel p-5 hover:border-bh-blood transition-colors"
            >
              <div className="flex items-center gap-4">
                <IconImg file={race.icon} size={56} alt="" />
                <div>
                  <h3 className="font-display text-lg group-hover:text-bh-blood transition-colors">
                    {race.displayName || race.key}
                  </h3>
                  <p className="mt-1 text-sm text-bh-mute line-clamp-2">
                    {race.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <hr className="border-bh-rule" />

      {/* Every unit, by faction (lead-in to the full index) */}
      <section className="py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-bh-mute mb-3">
          07 · The armies
        </p>
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl">Every unit in the game</h2>
          <Link
            href="/wiki/units"
            className="text-sm text-bh-blood hover:text-bh-bloodInk transition-colors"
          >
            Browse all units →
          </Link>
        </div>
        <div className="space-y-6">
          {groups.map(({ race, units }) =>
            units.length === 0 ? null : (
              <div key={race.id} className="flex items-center gap-4">
                <div className="w-40 shrink-0 flex items-center gap-2">
                  <IconImg file={race.icon} size={28} alt="" />
                  <span className="text-sm font-medium truncate">
                    {race.displayName || race.key}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {units.map((u) => (
                    <Link
                      key={u.id}
                      href={`/wiki/unit/${slugOf(u.key)}`}
                      title={u.displayName || u.key}
                      className="hover:opacity-75 transition-opacity"
                    >
                      <IconImg file={u.icon} size={34} alt={u.displayName || u.key} />
                    </Link>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Closing call */}
      <hr className="border-bh-rule" />
      <section className="py-20 text-center">
        <h2 className="font-display text-3xl">Help us build this game</h2>
        <p className="mx-auto mt-4 max-w-prose text-bh-mute">
          Bloodlust &amp; Harmony is in alpha and the people playing it right
          now are steering balance, factions, and features. Join the Discord,
          request access, and your feedback goes straight into the next build.
        </p>
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded bg-bh-blood px-8 py-3 font-medium text-white hover:bg-bh-bloodInk transition-colors"
        >
          Join the Discord
        </a>
      </section>
    </div>
  );
}
