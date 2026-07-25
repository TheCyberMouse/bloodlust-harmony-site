import Link from "next/link";
import { DISCORD_URL, steamUrl } from "@/lib/links";

export const metadata = {
  title: "Play the alpha",
  description:
    "Bloodlust & Harmony is in active alpha and open by request. Join the Discord to get access, help shape the game, and wishlist on Steam.",
  alternates: { canonical: "/alpha" },
};

const STEPS = [
  {
    n: "1",
    title: "Join the Discord",
    body: "It is where the alpha lives: builds, patch notes, feedback, and the developer.",
  },
  {
    n: "2",
    title: "Request access",
    body: "Ask in the alpha channel. We are actively looking for testers, so you will not wait long.",
  },
  {
    n: "3",
    title: "Play and shape it",
    body: "Get your build, jump into a match, and your feedback goes straight into the next version.",
  },
];

export default function AlphaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-bh-blood mb-4">
        Now in alpha
      </p>
      <h1 className="font-display text-4xl sm:text-5xl">Play the alpha</h1>
      <p className="mt-4 max-w-prose text-lg text-bh-mute">
        Bloodlust &amp; Harmony is in active alpha and open by request. The
        people testing it right now are steering balance, factions, and
        features. If that sounds like your kind of thing, come in.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-bh-blood px-8 py-3 text-center font-medium text-white hover:bg-bh-bloodInk transition-colors"
        >
          Join the Discord to request access
        </a>
        <a
          href={steamUrl("alpha_page")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-bh-rule px-6 py-3 text-center font-medium text-bh-ink hover:border-bh-mute transition-colors"
        >
          Wishlist on Steam
        </a>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n}>
            <div className="font-display text-3xl text-bh-blood">{s.n}</div>
            <h2 className="font-display text-lg mt-1">{s.title}</h2>
            <p className="mt-1 text-sm text-bh-mute leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 max-w-prose rounded-lg border border-bh-rule bg-bh-panel p-6">
        <h2 className="font-display text-xl mb-3">What to expect</h2>
        <p className="text-bh-mute leading-relaxed">
          This is early. The gameplay, the five modes, and the counter system
          are all in and playable, but sound, effects, and 2D art are still
          catching up. You are here to find what is broken and tell us what
          feels good and what does not. That feedback is the whole point of the
          alpha, and it is why the game gets better every build.
        </p>
      </div>

      <div className="mt-10 text-bh-mute">
        <p>
          New to the game? Start with{" "}
          <Link
            href="/how-to-play"
            className="text-bh-blood hover:text-bh-bloodInk transition-colors"
          >
            How to Play
          </Link>{" "}
          or browse the{" "}
          <Link
            href="/wiki"
            className="text-bh-blood hover:text-bh-bloodInk transition-colors"
          >
            wiki
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
