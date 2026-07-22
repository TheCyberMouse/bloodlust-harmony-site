import IconImg from "@/components/IconImg";
import { tagLeaf } from "@/lib/wiki";

/**
 * Attack/armor/element badge with the game's own icon when the meta icon
 * maps have one for the tag (they arrive via the sync; missing icon = text
 * badge only, never broken).
 */
export default function TagBadge({
  tag,
  prefix,
  iconMap,
  tone = "",
}: {
  tag: string;
  prefix?: string;
  iconMap?: Record<string, string>;
  tone?: string;
}) {
  const iconFile = iconMap?.[tag];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border border-bh-rule bg-bh-panel px-2 py-0.5 text-xs ${tone}`}
    >
      {iconFile ? <IconImg file={iconFile} size={16} alt="" /> : null}
      {prefix ? <span className="text-bh-mute">{prefix}</span> : null}
      {tagLeaf(tag)}
    </span>
  );
}
