"use client";

import { useState } from "react";
import Link from "next/link";
import HoverCard from "@/components/HoverCard";
import IconImg from "@/components/IconImg";

export type DeckRow = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  faction: string;
  unitClass: string;
  min: number;
  max: number;
  statsLine: string;
  description: string;
};

type SortKey = "name" | "faction" | "unitClass" | "range";

export default function PokerDeckTable({ rows }: { rows: DeckRow[] }) {
  const [key, setKey] = useState<SortKey>("name");
  const [dir, setDir] = useState<1 | -1>(1);

  const click = (k: SortKey) => {
    if (k === key) setDir((d) => (d === 1 ? -1 : 1));
    else {
      setKey(k);
      setDir(1);
    }
  };

  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    if (key === "range") cmp = a.max - b.max || a.min - b.min;
    else cmp = a[key].localeCompare(b[key]);
    if (cmp === 0) cmp = a.name.localeCompare(b.name);
    return cmp * dir;
  });

  const arrow = (k: SortKey) => (k === key ? (dir === 1 ? " ↑" : " ↓") : "");

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="py-2 pr-4 font-normal">
      <button
        type="button"
        onClick={() => click(k)}
        className={`uppercase tracking-wide transition-colors hover:text-bh-ink ${
          k === key ? "text-bh-ink" : "text-bh-mute"
        }`}
      >
        {label}
        {arrow(k)}
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs">
            <Th k="name" label="Card" />
            <Th k="faction" label="Faction" />
            <Th k="unitClass" label="Class" />
            <Th k="range" label="Per card" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id} className="border-t border-bh-rule">
              <td className="py-2 pr-4">
                <HoverCard
                  panel={
                    <span className="block w-56">
                      <span className="block font-medium text-bh-ink">
                        {r.name}
                      </span>
                      {r.unitClass ? (
                        <span className="block text-xs text-bh-gold">
                          {r.unitClass}
                        </span>
                      ) : null}
                      {r.statsLine ? (
                        <span className="mt-1 block text-xs text-bh-mute">
                          {r.statsLine}
                        </span>
                      ) : null}
                      {r.description ? (
                        <span className="mt-1.5 block text-xs text-bh-mute">
                          {r.description}
                        </span>
                      ) : null}
                    </span>
                  }
                >
                  <Link
                    href={`/wiki/unit/${r.slug}`}
                    className="group flex items-center gap-3 font-medium text-bh-ink hover:text-bh-blood transition-colors"
                  >
                    <IconImg file={r.icon} size={48} alt="" />
                    {r.name}
                  </Link>
                </HoverCard>
              </td>
              <td className="py-2 pr-4 text-bh-mute whitespace-nowrap">
                {r.faction}
              </td>
              <td className="py-2 pr-4 text-bh-mute whitespace-nowrap">
                {r.unitClass || "—"}
              </td>
              <td className="py-2 pr-4 text-bh-ink whitespace-nowrap">
                {r.min === r.max ? `${r.min}` : `${r.min} to ${r.max}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
