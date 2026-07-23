// =============================================================================
// Meta-text helpers. Descriptions come from in-game tooltip text (which uses
// the game's rich-text color tags) or from wiki_pages HTML bodies; both need
// flattening to clean plain text before they can be meta descriptions.
// =============================================================================

const GAME_TAG_RE = /<(\w+)>(.*?)<\/>/gs; // same grammar as lib/richtext.tsx

/** In-game rich text -> plain text: "<dmg>25</> damage" -> "25 damage". */
export function stripGameText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(GAME_TAG_RE, "$2")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** wiki_pages bodies are HTML or plain text; flatten either. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** ~155 chars, cut on a word boundary, ellipsis only when truncated. */
export function truncate(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return (at > 60 ? cut.slice(0, at) : cut).replace(/[,.;:\s]+$/, "") + "…";
}

/** First non-empty candidate wins; caller pre-strips as needed. */
export function metaDescription(
  ...candidates: Array<string | undefined>
): string {
  for (const c of candidates) {
    const t = (c ?? "").trim();
    if (t) return truncate(t);
  }
  return "";
}
