import { GAME_MODES } from "@/lib/modes";
import { OG_SIZE, renderPageCard } from "@/lib/ogcard";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Game modes in Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderPageCard({
    eyebrow: "WIKI",
    title: "Game Modes",
    subtitle: "Eight ways to play, from the classic loop to army poker.",
    chips: GAME_MODES.map((m) => m.name),
  });
}
