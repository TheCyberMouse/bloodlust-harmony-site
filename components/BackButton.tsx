"use client";

import { useRouter } from "next/navigation";

/**
 * Upper-left back control for detail pages. Uses real browser history when
 * there is any (preserves scroll position on the list you came from);
 * falls back to a sensible index route on a fresh tab / direct link.
 */
export default function BackButton({ fallback = "/wiki" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="mb-6 inline-flex items-center gap-1.5 rounded border border-bh-rule bg-bh-panel px-3 py-1.5 text-sm text-bh-mute hover:border-bh-mute hover:text-bh-ink transition-colors"
    >
      <span aria-hidden>&#8592;</span> Back
    </button>
  );
}
