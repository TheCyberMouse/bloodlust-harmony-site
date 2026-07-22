"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { Screenshot } from "@/lib/screenshots";

/** Crossfading 16:9 slideshow. Auto-advances; arrows + dots; pauses on hover. */
export default function Slideshow({ images }: { images: Screenshot[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (delta: number) =>
      setIndex((i) => (i + delta + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (paused || images.length < 2) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, images.length, go]);

  if (images.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-bh-rule bg-bh-panel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-video">
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={1920}
            height={1080}
            priority={i === 0}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous screenshot"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/75 transition-colors"
          >
            &#8592;
          </button>
          <button
            type="button"
            aria-label="Next screenshot"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/75 transition-colors"
          >
            &#8594;
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Screenshot ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
