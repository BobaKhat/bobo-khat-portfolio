"use client";

import { type CSSProperties } from "react";

// Decorative Figma-style multiplayer cursors that drift near the hero heading —
// one on the left, two on the right. Each floats within a small radius forever
// (CSS infinite animation) and simply stays put; a page refresh remounts them.
// Desktop only (lg+) — hidden on mobile and tablet, where there's no room
// beside the heading.
//
// Interactions:
//   Interaction → click: ground ripple radiates from the cursor (GroundRipple)
//   Design      → hover: a Figma selection frame snaps around the hero heading
//                 (driven by :has() in globals.css + HeadingSelection.tsx)
//   Visual      → hover: a color-swatch accordion fans out of the cursor

type Cursor = {
  label: string;
  color: string;
  /** Position within the centered container (keeps them near the heading). */
  pos: string;
  /** Entrance-then-float animation class (see globals.css). */
  anim: string;
};

const CURSORS: Cursor[] = [
  { label: "Interaction", color: "#8b5cf6", pos: "left-0 top-[40%]", anim: "cursor-anim-1" }, // purple, left
  { label: "Design", color: "#ec4899", pos: "right-0 top-[24%]", anim: "cursor-anim-2" }, // pink, right
  { label: "Visual", color: "#22c55e", pos: "right-[7%] top-[56%]", anim: "cursor-anim-3" }, // green, right
];

// Swatches for the Visual cursor's color fan, arced out from the cursor tip.
// Each swatch's RESTING spot is the previous swatch's position (origin for the
// first), so on hover they deal out one-from-another like an accordion, and
// fold back in on hover-out. (--px/--py/--pr = that resting/previous spot.)
const FAN_COLORS = ["#fb7185", "#fbbf24", "#2dd4bf", "#818cf8", "#f472b6"];
const FAN_POS = FAN_COLORS.map((_, i) => {
  const a = ((-150 + i * 30) * Math.PI) / 180; // -150°…-30°, an upward arc
  return {
    x: `${Math.round(46 * Math.cos(a))}px`,
    y: `${Math.round(46 * Math.sin(a))}px`,
    r: `${(i - 2) * 12}deg`,
  };
});
const FAN = FAN_COLORS.map((color, i) => {
  const prev = i === 0 ? { x: "0px", y: "0px", r: "0deg" } : FAN_POS[i - 1];
  return { color, ...FAN_POS[i], px: prev.x, py: prev.y, pr: prev.r };
});

export default function FloatingCursors() {
  const onInteractionClick = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    // Emanate the ripple from the arrow tip (~5,4 from the cursor top-left).
    window.dispatchEvent(
      new CustomEvent("ground-ripple", {
        detail: { x: r.left + 5, y: r.top + 4 },
      }),
    );
    // Hold the cursor still while the ripple radiates, then resume floating.
    el.style.animationPlayState = "paused";
    window.setTimeout(() => {
      el.style.animationPlayState = "";
    }, 1000);
    // Press the cursor (quick scale toward the tip) to sell the click.
    const inner = el.querySelector<HTMLElement>(".cursor-inner");
    if (inner) {
      inner.classList.remove("cursor-pressing");
      void inner.offsetWidth; // reflow so the animation restarts every click
      inner.classList.add("cursor-pressing");
    }
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
    >
      {/* Centered box so the cursors flank the heading at any screen width. */}
      <div className="relative mx-auto h-full max-w-[880px]">
        {CURSORS.map((c) => {
          const isDesign = c.label === "Design";
          const isVisual = c.label === "Visual";
          const isInteraction = c.label === "Interaction";
          // All three are interactive (receive pointer events / hover); only
          // Interaction has a click action.
          return (
            <div
              key={c.label}
              className={`cursor-tag pointer-events-auto absolute ${c.pos} ${
                c.anim
              } ${isInteraction ? "cursor-pointer" : ""} ${
                isDesign ? "cursor-tag--design" : ""
              }`}
              style={{ color: c.color }}
              onClick={
                isInteraction
                  ? (e) => onInteractionClick(e.currentTarget)
                  : undefined
              }
            >
              {/* Inner wrapper carries the click "press" (scale), so it composes
                  with the outer float (translate) without a jump. */}
              <div className="cursor-inner">
                <svg width="28" height="30" viewBox="0 0 28 30" fill="none">
                  <path
                    d="M5 3.5 L5 22 L10.2 17.2 L13.6 24.6 L16.7 23.1 L13.1 15.9 L20.4 15.9 Z"
                    fill="currentColor"
                    stroke="#fff"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="cursor-label">{c.label}</span>
                {isVisual && (
                  <div className="cursor-fan">
                    {FAN.map((s, i) => (
                      <span
                        key={i}
                        className="fan-swatch"
                        style={
                          {
                            "--x": s.x,
                            "--y": s.y,
                            "--r": s.r,
                            "--px": s.px,
                            "--py": s.py,
                            "--pr": s.pr,
                            background: s.color,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
