"use client";

import { useState } from "react";
import ArrowGlyph from "./ArrowGlyph";
import { SpotlightOverlay, SpotlightCaption } from "./Spotlight";

export default function LabCard({ previews }: { previews: string[] }) {
  const [arrowHover, setArrowHover] = useState(false);

  return (
    <a
      href="/lab/visual-experiments"
      className={`group relative block scroll-mt-20 min-[1200px]:col-span-2 ${
        arrowHover ? "z-[70]" : ""
      }`}
    >
      <SpotlightOverlay active={arrowHover} />

      <div className="relative z-[1] flex flex-col overflow-hidden rounded-3xl bg-module p-5 shadow-[var(--shadow-raised)] transition-transform duration-300 group-hover:-translate-y-1 sm:p-6 md:p-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span className="t-heading text-2xl text-text-primary sm:text-3xl">The Lab</span>
            </div>
            <p className="t-subtitle mt-2 text-sm text-text-secondary">
              Visual Experiments — Graphic design + 3D renders
            </p>
          </div>
          {/* Gallery label, with the arrow button below it. min-w-0 so the
              label wraps on a narrow card instead of pushing the row wider. */}
          <div className="ml-auto flex min-w-0 flex-col items-end gap-3">
            <span className="text-right text-xs text-text-secondary">See the full gallery</span>
            <div
              className="relative"
              onMouseEnter={() => setArrowHover(true)}
              onMouseLeave={() => setArrowHover(false)}
            >
              <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-module text-lg text-text-primary shadow-[var(--shadow-raised-sm)] transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                <ArrowGlyph />
              </span>
              <SpotlightCaption label="Visual Experiments" active={arrowHover} align="right" />
            </div>
          </div>
        </div>

        {/* Divider between the header and the work */}
        <div className="my-5 border-t border-text-secondary/30" />

        {/* Full 4-up on mobile and desktop. In the tablet range (md–1199) the
            card is only half-width (side by side with Product Advertisement),
            so drop to a 2-up and hide the last two previews — otherwise four
            thumbnails would squeeze into the narrow column. */}
        <div className="grid grid-cols-2 gap-3 min-[1200px]:grid-cols-4">
          {previews.map((src, i) => (
            <div
              key={src}
              className={`aspect-[4/3] overflow-hidden rounded-xl ${
                i >= 2 ? "md:max-[1199px]:hidden" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Visual experiment preview"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </a>
  );
}
