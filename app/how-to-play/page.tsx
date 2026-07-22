import Link from "next/link";
import { DISCORD_URL } from "@/lib/links";

export const metadata = { title: "How to play" };

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl text-bh-ink mb-4">{title}</h2>
      <div className="max-w-prose space-y-3 text-bh-mute leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function HowToPlayPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl">How to play</h1>
      <p className="mt-3 max-w-prose text-lg text-bh-mute">
        Bloodlust &amp; Harmony is an auto-battler RTS. You never control your
        units. You build the machine that produces them, and the machine goes
        to war on its own. This page covers everything you need for your first
        match.
      </p>

      <Section title="The goal">
        <p>
          Each team has a castle. Destroy the enemy castle and you win; lose
          yours and you are out. Matches run a set number of waves (30 by
          default). If the castles still stand when the waves run out, the
          match heads into Sudden Death to force a finish.
        </p>
      </Section>

      <Section title="Your buildings are your army">
        <p>
          Every unit building you place adds soldiers to your team&apos;s
          waves. A wave spawns every 60 seconds and marches down the lane
          toward the enemy castle, fighting everything in its path. Units
          pick their own targets and use their own abilities: your job is
          deciding WHAT gets built, not micromanaging the fight.
        </p>
        <p>
          Buildings go on your build plot. Towers are the exception: they only
          fit on dedicated tower spots, and they defend the ground they can
          reach. Most unit buildings can also be upgraded into stronger
          versions that train better units.
        </p>
        <p>
          In the default team mode, teammates take turns: each wave is fielded
          by one member of the team, rotating. The wave counter at the top of
          the screen shows whose turn is next and when.
        </p>
      </Section>

      <Section title="The economy">
        <p>
          Four numbers run your engine. Understanding them is most of the
          game.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-bh-ink">Gold</strong> arrives every 30
            seconds from your Income. Everything is bought with it.
          </li>
          <li>
            <strong className="text-bh-ink">Income</strong> grows when you
            spend: every 10 Gold spent on unit buildings adds +1 Income.
            Spending IS investing. A player who banks gold falls behind one
            who turns it into buildings.
          </li>
          <li>
            <strong className="text-bh-ink">Wood</strong> arrives as a bonus
            when you place unit buildings. Spend it on special buildings.
          </li>
          <li>
            <strong className="text-bh-ink">Stardust</strong> is the rare
            one. You start with a little and gain more only rarely; it buys
            the most powerful buildings. Spend it carefully.
          </li>
        </ul>
        <p>
          <strong className="text-bh-ink">Food</strong> is the cap on all of
          it: unit buildings cost Food, and your Food limit decides how much
          army you can field at once. Research can raise the cap.
        </p>
      </Section>

      <Section title="Winning the fight">
        <p>
          Two identical armies never trade evenly. Every attack has an attack
          type, every unit has an armor type, and the{" "}
          <Link href="/wiki/matrix" className="text-bh-blood hover:text-bh-bloodInk transition-colors">
            damage matrix
          </Link>{" "}
          decides the multiplier where they meet. Scout what the enemy is
          massing, then build what counters it.
        </p>
        <p>
          On top of that sit elements (fire, ice, poison, lightning, arcane
          and friends), immunities that zero them out, and{" "}
          <Link href="/wiki/statuses" className="text-bh-blood hover:text-bh-bloodInk transition-colors">
            status effects
          </Link>{" "}
          like stuns, slows, and auras. When your waves suddenly stop trading
          well, the answer is almost always in the matchup, not the stat
          totals.
        </p>
      </Section>

      <Section title="Shop and research">
        <p>
          The build bar has three tabs. Build places buildings. Research
          unlocks faction upgrades, most of them tiered, that improve your
          units or your economy for the rest of the match. Shop offers
          resource trades and one-off items like a team-wide protection
          scroll, each on its own cooldown.
        </p>
      </Section>

      <Section title="Match setup">
        <p>
          Single player: New Game gives you a 1v1 against an AI opponent.
          Multiplayer: Create Server lets you set team count, players per
          team, wave mode, fog of war, and the round limit; friends join from
          the server browser. Quickplay is the ranked queue: pick a faction,
          get matched 1v1, and your rating moves with the result.
        </p>
      </Section>

      <Section title="Controls">
        <ul className="list-disc space-y-2 pl-5">
          <li>Camera: WASD or push the mouse to the screen edge. Click and hold the minimap to glide.</li>
          <li>Tab cycles between your buildings.</li>
          <li>Shift+Click keeps placing the same building (Quick Build).</li>
          <li>HUD buttons toggle health bars and floating damage numbers.</li>
        </ul>
      </Section>

      <section className="mt-14 rounded-lg border border-bh-rule bg-bh-panel p-6 text-center">
        <h2 className="font-display text-2xl">Ready to play?</h2>
        <p className="mx-auto mt-2 max-w-prose text-bh-mute">
          The alpha is open by request and tester feedback steers what gets
          built next. Ask in the Discord and we will get you a key.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-bh-blood px-6 py-2.5 font-medium text-white hover:bg-bh-bloodInk transition-colors"
          >
            Join the Discord
          </a>
          <Link
            href="/wiki"
            className="rounded border border-bh-rule px-6 py-2.5 font-medium text-bh-ink hover:border-bh-mute transition-colors"
          >
            Browse the wiki
          </Link>
        </div>
      </section>
    </div>
  );
}
