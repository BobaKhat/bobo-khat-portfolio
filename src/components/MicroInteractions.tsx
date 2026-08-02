"use client";

import { useRef, useState } from "react";
import { NetworthChart } from "./NetworthChart";
import { SkeletonSearch } from "./SkeletonSearch";
import { ProgressBar } from "./ProgressBar";
import { AppDock } from "./AppDock";
import { LiquidBlob } from "./LiquidBlob";
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
        className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-module text-lg text-text-primary shadow-[var(--shadow-raised-sm)] transition-colors duration-300 hover:bg-accent hover:text-white"
      >
        <ArrowGlyph />
      </a>
      <SpotlightCaption label={label} active={hovered === id} align="right" />
    </div>
  );
}

/*
  Shared tile so the Net Worth, Search, and Deploy demos read as the same
  size. Each component keeps its native design and stays fully interactive —
  it's just `contain`-scaled inside a common footprint, so no distortion.
  Content is top-aligned (not centered) so all three surface at the same
  level even though their aspect ratios differ; a shorter demo just leaves
  its leftover space at the bottom.
*/
const TILE_W = 360;
const TILE_H = 380;
function DemoTile({
  contentW,
  contentH,
  scale,
  rounded = false,
  children,
}: {
  contentW: number;
  contentH: number;
  scale: number;
  rounded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-start justify-center overflow-hidden ${
        rounded ? "rounded-[20px]" : ""
      }`}
      style={{ width: TILE_W, height: TILE_H }}
    >
      <div
        style={{
          width: contentW,
          height: contentH,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
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

  // Which buried demo is currently raised. Sticky state (not CSS :hover) so a
  // card stays up while you use it — it only drops when you leave the stage.
  const [playActive, setPlayActive] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeRef = useRef<number | null>(null);
  activeRef.current = playActive;

  // Pick the card under the pointer by its horizontal position (the demos are
  // fanned left→middle→right). This is position-based rather than per-card
  // hover, so sliding across the fan switches cleanly and a card rising out
  // from under the cursor never causes a flicker. While the pointer is over
  // the currently-raised card, keep it — so you can actually use it.
  function handleStageMove(e: React.MouseEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) return;
    const active = activeRef.current;
    if (active != null && cardRefs.current[active]?.contains(e.target as Node)) {
      return;
    }
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const idx = x < 0.37 ? 0 : x < 0.63 ? 1 : 2;
    if (idx !== active) setPlayActive(idx);
  }
  const playDemos = [
    {
      id: "networth",
      node: (
        <DemoTile contentW={311} contentH={395} scale={0.962}>
          <NetworthChart />
        </DemoTile>
      ),
    },
    {
      id: "deploy",
      node: (
        <DemoTile contentW={370} contentH={360} scale={0.973}>
          <ProgressBar />
        </DemoTile>
      ),
    },
    {
      id: "search",
      node: (
        <DemoTile contentW={410} contentH={404} scale={0.878}>
          <SkeletonSearch />
        </DemoTile>
      ),
    },
  ];

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
      <div className="relative z-[1] flex h-full flex-col justify-start gap-7">
        {/* Play card — the heading + subheading sit at the top, and all three
            demos are buried in the "ground" (this card's stage bottom) below
            them, tilted 30° and overlapping. Pointing at one shoots it up,
            flat and full-size, so it becomes usable. The raised state is
            sticky JS state (not CSS :hover) so it stays up while you use it,
            dropping only when you leave the stage. */}
        <div
          className="relative flex flex-none flex-col overflow-hidden rounded-3xl bg-module p-5 transition-shadow duration-300 sm:p-6"
          // container-type lets .play-stage scale to THIS card's width (see
          // the @container rule in globals.css), fixing the fixed-size demos
          // overflowing the narrow Microinteractions column at tablet width.
          style={{ ...cellStyle, containerType: "inline-size" }}
        >
          {/* min-h + items-start so this header matches the taller ProjectCard
              header (whose arrow sits in a tag+arrow column), keeping the
              divider level with the case-study cards. */}
          <div className="flex min-h-[74px] flex-wrap items-start justify-between gap-x-6 gap-y-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span className="t-heading text-2xl text-text-primary sm:text-3xl">
                  Microinteractions
                </span>
              </div>
              <a
                href={MOCEANVAULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="t-subtitle mt-1 inline-block text-sm text-text-secondary transition-colors hover:text-accent"
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

          {/* Divider between the header and the demos, matching the case-study cards */}
          <div className="my-5 border-t border-text-secondary/30" />

          <div
            ref={stageRef}
            className={`play-stage ${playActive !== null ? "has-active" : ""}`}
            onMouseMove={handleStageMove}
            onMouseLeave={() => setPlayActive(null)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setPlayActive(null);
              }
            }}
          >
            {playDemos.map((demo, i) => (
              <div
                key={demo.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={`play-item play-item--${i} ${
                  playActive === i ? "is-active" : ""
                }`}
                onFocus={() => setPlayActive(i)}
              >
                {demo.node}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`flex flex-none items-center justify-center overflow-hidden ${cellClass}`}
          style={cellStyle}
        >
          <MicroArrow
            id="dock"
            label="App Dock"
            hovered={hovered}
            setHovered={setHovered}
            className="absolute right-4 top-4 z-[2]"
          />
          {/* Fixed-width dock — icons drop out from the end as the screen
              narrows (see DOCK_HIDE_AT in AppDock) so it never overflows. */}
          <AppDock />
        </div>

        {/* Liquid Blob — a full-bleed canvas interaction on its own dark panel.
            This cell FLEX-GROWS to fill whatever vertical space is left in the
            column after the play card + dock. Because it grows rather than
            forcing a fixed height, the right column stops out-sizing the left
            (Group Canvas + Polaris), so those relax to their natural heights
            (closing the gap between them) and the blob ends flush with Polaris.
            The min-height keeps it presentable when the column stands alone on
            mobile. The canvas sizes to this box via its ResizeObserver. */}
        <div
          className="relative flex min-h-[240px] flex-1 flex-col rounded-2xl bg-module transition-shadow duration-300 sm:min-h-[300px]"
          style={{ ...cellStyle, padding: 20 }}
        >
          <MicroArrow
            id="blob"
            label="Neural Network"
            hovered={hovered}
            setHovered={setHovered}
            className="absolute right-4 top-4 z-[2]"
          />
          <div
            className="w-full flex-1 overflow-hidden"
            style={{
              minHeight: 0,
              borderRadius: 20,
              border: "0.5px solid #313131",
            }}
          >
            <LiquidBlob />
          </div>
        </div>
      </div>
    </section>
  );
}
