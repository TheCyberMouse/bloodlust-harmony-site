import fs from "fs";
import path from "path";

export type Screenshot = { src: string; alt: string };

/**
 * Enumerates public/screenshots at render time. Drop 1920x1080 files in that
 * folder and push; they appear in the home page slideshow sorted by filename
 * (prefix with 01-, 02-, ... to control order). The filename becomes the alt
 * text: "03-undead-castle-siege.jpg" -> "Undead castle siege".
 */
export function listScreenshots(): Screenshot[] {
  try {
    const dir = path.join(process.cwd(), "public", "screenshots");
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map((f) => {
        const base = f
          .replace(/\.[^.]+$/, "")
          .replace(/^[\d]+[-_ ]*/, "")
          .replace(/[-_]+/g, " ")
          .trim();
        return {
          src: `/screenshots/${f}`,
          alt: base ? base.charAt(0).toUpperCase() + base.slice(1) : "Screenshot",
        };
      });
  } catch {
    return [];
  }
}
