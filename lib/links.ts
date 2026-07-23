// Single source of truth for outbound community links.
export const DISCORD_URL = "https://discord.gg/fEUhhtbXmV";
export const STEAM_URL =
  "https://store.steampowered.com/app/4756660/Bloodlust__Harmony/";
export const REDDIT_URL = "https://www.reddit.com/r/BloodlustAndHarmony/";

/** Steam store link tagged for Valve's UTM analytics, so Steamworks shows
 *  which placement on the site actually drives wishlists. Keep the bare
 *  STEAM_URL for JSON-LD sameAs and anywhere identity (not attribution)
 *  matters. */
export function steamUrl(campaign: string, content?: string): string {
  const u = new URL(STEAM_URL);
  u.searchParams.set("utm_source", "bloodlustandharmony.com");
  u.searchParams.set("utm_medium", "web");
  u.searchParams.set("utm_campaign", campaign);
  if (content) u.searchParams.set("utm_content", content);
  return u.toString();
}
