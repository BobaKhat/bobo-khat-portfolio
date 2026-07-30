"use client";

import { useState } from "react";
import { NetworthChart } from "./NetworthChart";
import { ProgressBar } from "./ProgressBar";
import { AppDock } from "./AppDock";
import ArrowGlyph from "./ArrowGlyph";
import { SpotlightOverlay, SpotlightCaption } from "./Spotlight";

const MOCEANVAULT_URL = "https://moceanvault.vercel.app/";

// Arrow button + reveal caption shared by every microinteraction cell.
// Hovering any of them lifts the same shared `hovered` key, so all cells
// light up together while only the hovered arrow shows its caption.
function MicroArrow({
  id,
  label,
  hovered,
  setHovered,
  className = "relative",
}: {
  id: string;
  label: string;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  className?: string;
}) {
  return (
    <div
      className={className}
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
    >
      <a
        href={MOCEANVAULT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} — see all 18 on MoceanVault`}
        className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-module text-lg text-text-primary shadow-[var(--shadow-raised-sm)] transition-colors duration-300 hover:bg-accent hover:text-white"
      >
        <ArrowGlyph />
      </a>
      <SpotlightCaption label={label} active={hovered === id} align="right" />
    </div>
  );
}

// The 3 demos are real components ported from the MoceanVault project. Each
// microinteraction lives in its own extruded module with its own arrow; the
// cells stretch to fill the column so the stack sits flush next to Polaris.
export default function MicroInteractions({
  className = "",
}: {
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const anyHover = hovered !== null;

  const cellClass =
    "relative rounded-2xl bg-module px-4 py-2.5 transition-shadow duration-300";
  const cellStyle = {
    boxShadow: anyHover
      ? "var(--shadow-raised), 0 0 24px rgba(232, 93, 44, 0.35)"
      : "var(--shadow-raised)",
  };

  return (
    <section
      id="micro-interactions"
      className={`relative scroll-mt-20 flex flex-col ${
        anyHover ? "z-[70]" : ""
      } ${className}`}
    >
      <SpotlightOverlay active={anyHover} />
      <div className="relative z-[1] flex h-full flex-col justify-between gap-4">
        {/* Intro header cell */}
        <div className={cellClass} style={cellStyle}>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                <span className="t-eyebrow text-text-secondary">
                  Microinteractions
                </span>
              </div>
              <a
                href={MOCEANVAULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="t-subtitle mt-2 inline-block text-sm text-text-secondary transition-colors hover:text-accent"
              >
                See all 18 on MoceanVault
              </a>
            </div>
            <MicroArrow
              id="header"
              label="Microinteractions"
              hovered={hovered}
              setHovered={setHovered}
            />
          </div>
        </div>

        {/* Demo cells — each with its own arrow */}
        <div
          className={`flex items-center justify-center overflow-hidden ${cellClass}`}
          style={cellStyle}
        >
          <MicroArrow
            id="networth"
            label="Net Worth"
            hovered={hovered}
            setHovered={setHovered}
            className="absolute right-4 top-4 z-[2]"
          />
          <NetworthChart />
        </div>

        <div
          className={`flex items-center justify-center overflow-hidden ${cellClass}`}
          style={cellStyle}
        >
          <MicroArrow
            id="deploy"
            label="Deploy"
            hovered={hovered}
            setHovered={setHovered}
            className="absolute right-4 top-4 z-[2]"
          />
          <ProgressBar />
        </div>

        <div
          className={`flex items-center justify-center overflow-hidden ${cellClass}`}
          style={cellStyle}
        >
          <MicroArrow
            id="dock"
            label="App Dock"
            hovered={hovered}
            setHovered={setHovered}
            className="absolute right-4 top-4 z-[2]"
          />
          <AppDock />
        </div>
      </div>
    </section>
  );
}
