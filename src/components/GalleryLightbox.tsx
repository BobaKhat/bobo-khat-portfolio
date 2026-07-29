"use client";

import { useEffect } from "react";
import type { GalleryItem } from "@/components/GalleryMasonry";

/*
  Full-screen overlay that shows a single gallery item enlarged. Closes on
  backdrop click, the × button, or Escape. Clicks on the media itself are
  stopped from bubbling so interacting with video controls doesn't dismiss
  it. Body scroll is locked while open.
*/
export default function GalleryLightbox({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Expanded media"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
      >
        ×
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full max-w-full items-center justify-center"
      >
        {item.type === "video" ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={item.src}
            poster={item.poster}
            autoPlay
            loop
            muted
            playsInline
            controls
            className="max-h-[90vh] max-w-[92vw] rounded-xl"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt="Visual experiment — enlarged view"
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain"
          />
        )}
      </div>
    </div>
  );
}
