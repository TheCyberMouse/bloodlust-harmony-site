import { getBuildStamp } from "@/lib/wiki";

export default async function Footer() {
  const stamp = await getBuildStamp();
  const date = stamp.exportedAt
    ? new Date(stamp.exportedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <footer className="border-t border-bh-rule mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-bh-mute">
        <div>
          Bloodlust &amp; Harmony. A solo-developed auto-battler RTS.
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://discord.gg/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-bh-ink transition-colors"
          >
            Discord
          </a>
          <a
            href="https://www.reddit.com/r/BloodlustAndHarmony/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-bh-ink transition-colors"
          >
            Reddit
          </a>
          {stamp.version ? (
            <span className="text-xs">
              Game data v{stamp.version}
              {date ? ` · updated ${date}` : ""}
            </span>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
