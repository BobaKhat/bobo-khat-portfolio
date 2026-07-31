"use client";

import { useState } from "react";
import ArrowGlyph from "./ArrowGlyph";
import { SpotlightOverlay, SpotlightCaption } from "./Spotlight";

export default function LabCard({ previews }: { previews: string[] }) {
  const [arrowHover, setArrowHover] = useState(false);

  return (
    <a
      href="/lab/visual-experiments"
      className={`group relative block scroll-mt-20 md:col-span-2 ${
        arrowHover ? "z-[70]" : ""
      }`}
    >
      <SpotlightOverlay active={arrowHover} />

      <div className="relative z-[1] flex flex-col overflow-hidden rounded-3xl bg-module p-6 shadow-[var(--shadow-raised)] transition-transform duration-300 group-hover:-translate-y-1 md:p-8">
        <div className="flex items-start gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              <span className="t-heading text-3xl text-text-primary">The Lab</span>
            </div>
            <p className="t-subtitle mt-2 text-sm text-text-secondary">
              Visual Experiments — Graphic design + 3D renders
            </p>
          </div>
          {/* Gallery label, with the arrow button below it */}
          <div className="ml-auto flex shrink-0 flex-col items-end gap-3">
            <span className="text-xs text-text-secondary">See the full gallery</span>
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((src) => (
            <div key={src} className="aspect-[4/3] overflow-hidden rounded-xl">
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
