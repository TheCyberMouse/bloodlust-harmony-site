import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/JsonLd";
import {
  getBuildStamp,
  listBuildings,
  listProsePages,
  listRaces,
  listUnits,
  raceSlug,
  slugOf,
} from "@/lib/wiki";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [races, units, buildings, lore, guides, devlog, stamp] =
    await Promise.all([
      listRaces(),
      listUnits(),
      listBuildings(),
      listProsePages("lore"),
      listProsePages("guide"),
      listProsePages("devlog"),
      getBuildStamp(),
    ]);

  const now = new Date();
  // Game-data pages change exactly when a sync lands; use that timestamp so
  // lastModified is honest instead of always-now.
  const dataMod = stamp.exportedAt ? new Date(stamp.exportedAt) : now;

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/how-to-play`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/wiki`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/wiki/factions`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/wiki/units`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/wiki/buildings`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/wiki/abilities`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/wiki/researches`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/wiki/shop`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/wiki/matrix`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/wiki/statuses`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  for (const r of races) {
    entries.push({
      url: `${SITE_URL}/wiki/faction/${raceSlug(r)}`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const u of units) {
    entries.push({
      url: `${SITE_URL}/wiki/unit/${slugOf(u.key)}`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }
  for (const b of buildings) {
    entries.push({
      url: `${SITE_URL}/wiki/building/${slugOf(b.key)}`,
      lastModified: dataMod,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const [base, pages] of [
    ["lore", lore],
    ["guides", guides],
    ["devlog", devlog],
  ] as const) {
    entries.push({
      url: `${SITE_URL}/${base}`,
      lastModified: now,
      changeFrequency: base === "devlog" ? "weekly" : "monthly",
      priority: 0.6,
    });
    for (const p of pages) {
      entries.push({
        url: `${SITE_URL}/${base}/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
