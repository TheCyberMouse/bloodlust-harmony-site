import React from "react";

/**
 * Renders the game's tooltip rich text. The export keeps the in-game markup
 * verbatim: <dmg>14</>, <heal>+30</>, <util>800</>, <cost>10 mana</>,
 * <buff>Chilled</>, <debuff>Stunned</>, <flavor>...</>. Everything else is
 * plain text. Unknown tags render as plain text so new game decorators can
 * never break the site.
 */
const TAG_RE = /<(\w+)>(.*?)<\/>/gs;

export function GameText({ text }: { text: string | undefined | null }) {
  if (!text) return null;

  const nodes: React.ReactNode[] = [];
  let last = 0;
  let keyIdx = 0;
  for (const m of text.matchAll(TAG_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));
    nodes.push(
      <span key={keyIdx++} className={`rt-${m[1]}`}>
        {m[2]}
      </span>,
    );
    last = idx + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  return <>{nodes}</>;
}
