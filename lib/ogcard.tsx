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
    subtitle: "Castle Fight-style auto battler RTS",
  });
}
