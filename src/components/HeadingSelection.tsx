"use client";

import { useEffect, useRef, useState } from "react";

/*
  Figma-style "selection" frame that snaps around the hero heading when the
  Design cursor is hovered (shown via the :has() rule in globals.css). It draws
  the selection outline, eight resize handles, and a live dimension badge
  (measured from the wrapped heading, updated on resize).
*/
export default function HeadingSelection() {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current?.parentElement; // the heading wrapper
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setDims({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="heading-selection">
      <span className="hs-handle hs-tl" />
      <span className="hs-handle hs-tm" />
      <span className="hs-handle hs-tr" />
      <span className="hs-handle hs-lm" />
      <span className="hs-handle hs-rm" />
      <span className="hs-handle hs-bl" />
      <span className="hs-handle hs-bm" />
      <span className="hs-handle hs-br" />
      {dims && (
        <span className="hs-badge">
          {dims.w} × {dims.h}
        </span>
      )}
    </div>
  );
}
