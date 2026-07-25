"use client";

import { useEffect, useRef, useState } from "react";

export default function GalleryVideo({
  src,
  poster,
}: {
  src: string;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Trigger 1: start fetching the video well before it's actually on
  // screen (one screen-height of margin), so it's already buffered by the
  // time someone scrolls to it — this is what removes the lag.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: "800px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  // Trigger 2: only actually play/pause based on real visibility, so
  // videos aren't playing off-screen just because they preloaded early.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {
            // Autoplay can be blocked before user interaction on some
            // browsers; muted+playsInline covers most cases, this just
            // avoids an unhandled rejection if it happens anyway.
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className="w-full"
    />
  );
}
