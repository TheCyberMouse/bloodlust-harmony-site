// =============================================================================
// Shared renderer for the dynamic OG share cards (unit + faction pages).
// Satori/ImageResponse: no Tailwind here, explicit flex styles only, and the
// font must be a static TTF/OTF/WOFF (assets/fonts/Cinzel-Bold.woff, OFL).
// =============================================================================

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

const C = {
  night: "#0c0a10",
  panel: "#15121c",
  ink: "#e9e4d8",
  mute: "#8d8798",
  rule: "#282334",
  blood: "#c22d36",
  gold: "#c9a860",
};

async function cinzel() {
  const data = await readFile(
    join(process.cwd(), "assets", "fonts", "Cinzel-Bold.woff"),
  );
  return [
    { name: "Cinzel", data, weight: 700 as const, style: "normal" as const },
  ];
}

/** Fetch an icon into an ArrayBuffer for satori's <img>; null on any failure
 *  (the card renders without the image panel). */
export async function fetchOgImage(
  url: string | null | undefined,
): Promise<ArrayBuffer | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function renderOgCard(opts: {
  title: string;
  subtitle?: string;
  chips?: string[];
  image?: ArrayBuffer | null;
}): Promise<ImageResponse> {
  const fonts = await cinzel();
  const { title, subtitle, chips = [], image } = opts;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: C.night,
          color: C.ink,
          fontFamily: "Cinzel",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingRight: 40,
          }}
        >
          <div style={{ fontSize: 26, color: C.blood, letterSpacing: 6 }}>
            BLOODLUST &amp; HARMONY
          </div>
          <div
            style={{
              fontSize: title.length > 18 ? 58 : 72,
              marginTop: 18,
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 32, color: C.gold, marginTop: 12 }}>
              {subtitle}
            </div>
          ) : null}
          {chips.length > 0 ? (
            <div style={{ display: "flex", gap: 18, marginTop: 36 }}>
              {chips.map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    fontSize: 28,
                    border: `2px solid ${C.rule}`,
                    background: C.panel,
                    borderRadius: 10,
                    padding: "10px 22px",
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {image ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 400,
              height: 400,
              background: C.panel,
              border: `3px solid ${C.rule}`,
              borderRadius: 20,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img
              src={image as unknown as string}
              width={340}
              height={340}
              style={{ objectFit: "contain", borderRadius: 12 }}
            />
          </div>
        ) : null}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}

/** Plain branded card for missing records or failed icon fetches. */
export function brandedFallback(): Promise<ImageResponse> {
  return renderOgCard({
    title: "Bloodlust & Harmony",
    subtitle: "Castle Fight-style auto battler",
  });
}

/** The flagship home / site-wide share card: the wordmark in the logo's own
 *  colors (Bloodlust red, Harmony gold), the tagline, and the faction crests. */
export async function renderHomeCard(
  icons: ArrayBuffer[],
): Promise<ImageResponse> {
  const fonts = await cinzel();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: C.night,
          color: C.ink,
          fontFamily: "Cinzel",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: C.blood, letterSpacing: 6 }}>
            CASTLE FIGHT AUTO-BATTLER RTS
          </div>
          <div style={{ display: "flex", fontSize: 82, marginTop: 18 }}>
            <span style={{ color: C.blood }}>Bloodlust</span>
            <span style={{ color: C.ink, padding: "0 16px" }}>&amp;</span>
            <span style={{ color: C.gold }}>Harmony</span>
          </div>
          <div style={{ fontSize: 36, color: C.ink, marginTop: 22 }}>
            Build the army. Send the waves. Take the castle.
          </div>
        </div>
        {icons.length > 0 ? (
          <div style={{ display: "flex", gap: 20 }}>
            {icons.slice(0, 5).map((buf, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 118,
                  height: 118,
                  background: C.panel,
                  border: `2px solid ${C.rule}`,
                  borderRadius: 16,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img
                  src={buf as unknown as string}
                  width={94}
                  height={94}
                  style={{ objectFit: "contain", borderRadius: 10 }}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}

/** Fetch up to `max` icons from a list of candidate URLs. De-dupes by URL so
 *  units that share art never appear twice, and skips any that fail so the
 *  card still renders with whatever loaded. */
export async function fetchIcons(
  urls: Array<string | null | undefined>,
  max = 6,
): Promise<ArrayBuffer[]> {
  const seen = new Set<string>();
  const candidates: string[] = [];
  for (const u of urls) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    candidates.push(u);
    if (candidates.length >= max * 2) break;
  }
  const results = await Promise.all(candidates.map((u) => fetchOgImage(u)));
  return results
    .filter((b): b is ArrayBuffer => b !== null)
    .slice(0, max);
}

/** Multiplier -> solid swatch color, for the damage-matrix share card. */
export function matrixToneHex(m: number): string {
  if (m >= 1.5) return "#3fae5a";
  if (m > 1.0) return "#2c6e44";
  if (m === 1.0) return "#262130";
  if (m >= 0.6) return "#6e2f3a";
  return "#b53a48";
}

/** Page-specific share card: eyebrow + title + subtitle, with one of a row of
 *  framed icons, a color grid (the matrix), or text chips as the visual. */
export async function renderPageCard(opts: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icons?: ArrayBuffer[];
  chips?: string[];
  grid?: string[][];
}): Promise<ImageResponse> {
  const fonts = await cinzel();
  const {
    eyebrow = "BLOODLUST & HARMONY",
    title,
    subtitle,
    icons = [],
    chips = [],
    grid,
  } = opts;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: C.night,
          color: C.ink,
          fontFamily: "Cinzel",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: C.blood, letterSpacing: 6 }}>
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: title.length > 16 ? 62 : 78,
              marginTop: 14,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 34,
                color: C.gold,
                marginTop: 16,
                maxWidth: 960,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {grid ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {grid.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 4 }}>
                {row.map((c, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      width: 34,
                      height: 34,
                      borderRadius: 5,
                      background: c,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : icons.length > 0 ? (
          <div style={{ display: "flex", gap: 20 }}>
            {icons.slice(0, 6).map((buf, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 120,
                  height: 120,
                  background: C.panel,
                  border: `2px solid ${C.rule}`,
                  borderRadius: 16,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img
                  src={buf as unknown as string}
                  width={96}
                  height={96}
                  style={{ objectFit: "contain", borderRadius: 10 }}
                />
              </div>
            ))}
          </div>
        ) : chips.length > 0 ? (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {chips.map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  fontSize: 30,
                  border: `2px solid ${C.rule}`,
                  background: C.panel,
                  borderRadius: 10,
                  padding: "12px 26px",
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
