"use client";

import { useState } from "react";
import Link from "next/link";
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
type Tip = { row: DeckRow; top: number; left: number; above: boolean };

const TIP_WIDTH = 256;

export default function PokerDeckTable({ rows }: { rows: DeckRow[] }) {
  const [key, setKey] = useState<SortKey>("name");
  const [dir, setDir] = useState<1 | -1>(1);
  // A single fixed-position tooltip, so the table's overflow container never
  // clips it (an absolute tooltip inside overflow-auto gets cut off).
  const [tip, setTip] = useState<Tip | null>(null);

  const click = (k: SortKey) => {
    if (k === key) setDir((d) => (d === 1 ? -1 : 1));
    else {
      setKey(k);
      setDir(1);
    }
  };

  const showTip = (
    e: React.MouseEvent | React.FocusEvent,
    row: DeckRow,
  ) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const left = Math.max(
      12,
      Math.min(r.left, window.innerWidth - TIP_WIDTH - 12),
    );
    const above = r.top > 260;
    setTip({ row, top: above ? r.top - 8 : r.bottom + 8, left, above });
  };
  const hideTip = () => setTip(null);

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
    <>
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
                  <Link
                    href={`/wiki/unit/${r.slug}`}
                    onMouseEnter={(e) => showTip(e, r)}
                    onMouseLeave={hideTip}
                    onFocus={(e) => showTip(e, r)}
                    onBlur={hideTip}
                    className="group inline-flex items-center gap-3 font-medium text-bh-ink hover:text-bh-blood transition-colors"
                  >
                    <IconImg file={r.icon} size={48} alt="" />
                    {r.name}
                  </Link>
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

      {tip ? (
        <div
          style={{
            position: "fixed",
            top: tip.top,
            left: tip.left,
            width: TIP_WIDTH,
            transform: tip.above ? "translateY(-100%)" : undefined,
          }}
          className="pointer-events-none z-50 rounded-lg border border-bh-rule bg-bh-night p-3 shadow-xl"
        >
          <div className="font-medium text-bh-ink">{tip.row.name}</div>
          {tip.row.unitClass ? (
            <div className="text-xs text-bh-gold">{tip.row.unitClass}</div>
          ) : null}
          {tip.row.statsLine ? (
            <div className="mt-1 text-xs text-bh-mute">{tip.row.statsLine}</div>
          ) : null}
          {tip.row.description ? (
            <div className="mt-1.5 text-xs text-bh-mute leading-relaxed">
              {tip.row.description}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
