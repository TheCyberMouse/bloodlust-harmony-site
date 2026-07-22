import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/JsonLd";
import {
  listBuildings,
  listProsePages,
  listRaces,
  listUnits,
  slugOf,
} from "@/lib/wiki";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [races, units, buildings, lore, guides, devlog] = await Promise.all([
    listRaces(),
    listUnits(),
    listBuildings(),
    listProsePages("lore"),
    listProsePages("guide"),
    listProsePages("devlog"),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/wiki`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/wiki/units`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/wiki/buildings`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/wiki/abilities`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/wiki/matrix`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/wiki/statuses`, lastModified: now, priority: 0.5 },
  ];

  for (const r of races) {
    entries.push({
      url: `${SITE_URL}/wiki/faction/${slugOf(r.key)}`,
      lastModified: now,
      priority: 0.8,
    });
  }
  for (const u of units) {
    entries.push({
      url: `${SITE_URL}/wiki/unit/${slugOf(u.key)}`,
      lastModified: now,
      priority: 0.6,
    });
  }
  for (const b of buildings) {
    entries.push({
      url: `${SITE_URL}/wiki/building/${slugOf(b.key)}`,
      lastModified: now,
      priority: 0.6,
    });
  }

  for (const [base, pages] of [
    ["lore", lore],
    ["guides", guides],
    ["devlog", devlog],
  ] as const) {
    entries.push({ url: `${SITE_URL}/${base}`, lastModified: now, priority: 0.6 });
    for (const p of pages) {
      entries.push({
        url: `${SITE_URL}/${base}/${p.slug}`,
        lastModified: new Date(p.updated_at),
        priority: 0.6,
      });
    }
  }

  return entries;
}
