import { iconUrl } from "@/lib/supabase";

/**
 * Game icon from Supabase Storage. Plain <img> with explicit dimensions
 * (prevents layout jumps; icons are small enough that next/image adds no
 * value). Renders a subtle placeholder box when the record has no icon.
 */
export default function IconImg({
  file,
  size = 40,
  alt = "",
  className = "",
}: {
  file: string | null | undefined;
  size?: number;
  alt?: string;
  className?: string;
}) {
  const url = iconUrl(file);
  if (!url) {
    return (
      <span
        className={`inline-block rounded border border-bh-rule bg-bh-panel ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      width={size}
      height={size}
      alt={alt}
      loading="lazy"
      className={`inline-block rounded border border-bh-rule bg-bh-panel object-cover ${className}`}
    />
  );
}
